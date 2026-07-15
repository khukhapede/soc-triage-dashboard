import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Alert } from '../database/entities/alert.entity';
import { AlertScore } from '../database/entities/alert-score.entity';
import { AlertTechnique } from '../database/entities/alert-technique.entity';

// Verified against attack.mitre.org/tactics/enterprise/ (ATT&CK v19.1, July 2026)
const TACTIC_POSITIONS: Record<string, number> = {
    'Reconnaissance': 1,
    'Resource Development': 2,
    'Initial Access': 3,
    'Execution': 4,
    'Persistence': 5,
    'Privilege Escalation': 6,
    'Stealth': 7,
    'Defense Impairment': 8,
    'Credential Access': 9,
    'Discovery': 10,
    'Lateral Movement': 11,
    'Collection': 12,
    'Command and Control': 13,
    'Exfiltration': 14,
    'Impact': 15,
};
const TOTAL_TACTICS = 15;

// CIS Benchmark / NIST SP 800-53 AC-7 aligned default
const FREQUENCY_WINDOW_MINUTES = 15;
const FREQUENCY_THRESHOLD = 10;

@Injectable()
export class ScoringService {
    private readonly logger = new Logger(ScoringService.name);

    constructor(
        @InjectRepository(AlertScore)
        private readonly scoreRepository: Repository<AlertScore>,
        @InjectRepository(AlertTechnique)
        private readonly alertTechniqueRepository: Repository<AlertTechnique>,
        @InjectRepository(Alert)
        private readonly alertRepository: Repository<Alert>,
    ) { }

    async scoreAlert(alert: Alert): Promise<void> {
        const severityScore = alert.ruleLevel / 16;
        const techniqueCriticality = await this.computeTechniqueCriticality(alert);
        const frequencyScore = await this.computeFrequencyScore(alert);

        const finalScore =
            severityScore * 0.4 + techniqueCriticality * 0.4 + frequencyScore * 0.2;

        const score = this.scoreRepository.create({
            alert,
            severityScore,
            techniqueScore: techniqueCriticality,
            frequencyScore,
            finalScore,
        });

        await this.scoreRepository.save(score);
        this.logger.log(
            `Scored alert ${alert.id}: final=${finalScore.toFixed(3)} (sev=${severityScore.toFixed(2)}, tech=${techniqueCriticality.toFixed(2)}, freq=${frequencyScore.toFixed(2)})`,
        );
    }

    private async computeTechniqueCriticality(alert: Alert): Promise<number> {
        const links = await this.alertTechniqueRepository.find({
            where: { alert: { id: alert.id } },
            relations: { technique: true },
        });

        if (links.length === 0) return 0;

        const positions = links.map((link) => {
            const position = TACTIC_POSITIONS[link.technique.tactic];
            return position ? position / TOTAL_TACTICS : 0;
        });

        return Math.max(...positions);
    }

    private async computeFrequencyScore(alert: Alert): Promise<number> {
        const windowStart = new Date(Date.now() - FREQUENCY_WINDOW_MINUTES * 60 * 1000);

        const count = await this.alertRepository.count({
            where: {
                ruleId: alert.ruleId,
                createdAt: MoreThan(windowStart),
            },
        });

        return Math.min(count / FREQUENCY_THRESHOLD, 1.0);
    }
}