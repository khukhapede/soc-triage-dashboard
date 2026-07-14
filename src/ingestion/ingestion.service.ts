import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import chokidar, { FSWatcher } from 'chokidar';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../database/entities/alert.entity';

interface IngestionState {
  offset: number;
  inode: number;
}

@Injectable()
export class IngestionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IngestionService.name);

  private readonly alertsFilePath = '/var/ossec/logs/alerts/alerts.json';
  private readonly stateFilePath = path.join(process.cwd(), '.ingestion-state.json');

  private watcher: FSWatcher;
  private state: IngestionState;
  private isProcessing = false;

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
  ) { }

  async onModuleInit() {
    this.logger.log('Ingestion service starting...');
    this.state = this.loadState();
    this.startWatching();
  }

  onModuleDestroy() {
    if (this.watcher) {
      this.watcher.close();
    }
  }

  private loadState(): IngestionState {
    if (fs.existsSync(this.stateFilePath)) {
      const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
      try {
        return JSON.parse(raw);
      } catch {
        this.logger.warn('Could not parse state file, resetting');
      }
    }

    const stats = fs.existsSync(this.alertsFilePath)
      ? fs.statSync(this.alertsFilePath)
      : null;

    return {
      offset: stats ? stats.size : 0,
      inode: stats ? stats.ino : 0,
    };
  }

  private saveState() {
    fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2));
  }

  private startWatching() {
    this.watcher = chokidar.watch(this.alertsFilePath, {
      persistent: true,
      usePolling: false,
    });

    this.watcher
      .on('add', () => this.handleFileEvent())
      .on('change', () => this.handleFileEvent())
      .on('unlink', () => {
        this.logger.warn('alerts.json removed (likely rotation in progress)');
      })
      .on('error', (err) => this.logger.error(`Watcher error: ${err}`));

    this.logger.log(`Watching ${this.alertsFilePath}`);
  }

  private async handleFileEvent() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      if (!fs.existsSync(this.alertsFilePath)) {
        this.isProcessing = false;
        return;
      }

      const stats = fs.statSync(this.alertsFilePath);

      if (this.state.inode && stats.ino !== this.state.inode) {
        this.logger.log('Detected log rotation — resetting offset');
        this.state.offset = 0;
        this.state.inode = stats.ino;
      }

      if (stats.size < this.state.offset) {
        this.logger.warn('File smaller than offset — resetting to 0');
        this.state.offset = 0;
      }

      if (stats.size === this.state.offset) {
        this.isProcessing = false;
        return;
      }

      await this.readNewLines(stats.size);
      this.state.inode = stats.ino;
      this.saveState();
    } catch (err) {
      this.logger.error(`Error processing file event: ${err}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private readNewLines(fileSize: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(this.alertsFilePath, {
        start: this.state.offset,
        end: fileSize - 1,
        encoding: 'utf-8',
      });

      const rl = readline.createInterface({ input: stream });
      let bytesRead = this.state.offset;

      rl.on('line', (line) => {
        bytesRead += Buffer.byteLength(line, 'utf-8') + 1;
        if (!line.trim()) return;

        try {
          const alert = JSON.parse(line);
          this.processAlert(alert);
        } catch (err) {
          this.logger.warn(`Skipping malformed JSON line: ${err}`);
        }
      });

      rl.on('close', () => {
        this.state.offset = bytesRead;
        resolve();
      });

      rl.on('error', (err) => reject(err));
    });
  }

  private async processAlert(alert: any) {
    if (!alert.rule?.id || alert.rule?.level === undefined) {
      this.logger.warn('Skipping alert with missing rule id/level');
      return;
    }

    try {
      const newAlert = this.alertRepository.create({
        ruleId: parseInt(alert.rule.id, 10),
        ruleLevel: alert.rule.level,
        ruleDescription: alert.rule?.description ?? null,
        rawPayload: alert,
        agentName: alert.agent?.name ?? null,
        alertTime: alert.timestamp ? new Date(alert.timestamp) : undefined,
      });

      await this.alertRepository.save(newAlert);

      this.logger.log(
        `Alert saved: rule=${newAlert.ruleId} level=${newAlert.ruleLevel} desc="${newAlert.ruleDescription}"`,
      );
    } catch (err) {
      this.logger.error(`Failed to save alert: ${err}`);
    }
  }
}