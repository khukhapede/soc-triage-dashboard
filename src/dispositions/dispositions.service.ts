import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Alert } from '../database/entities/alert.entity';
import { AlertDisposition } from '../database/entities/alert-disposition.entity';
import { CreateDispositionDto } from './dto/create-disposition.dto';

@Injectable()
export class DispositionsService {
    constructor(
        @InjectRepository(Alert)
        private readonly alertRepository: Repository<Alert>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    async setDisposition(
        alertId: string,
        dto: CreateDispositionDto,
        analyst: string,
    ): Promise<AlertDisposition> {
        const alert = await this.alertRepository.findOne({ where: { id: alertId } });
        if (!alert) {
            throw new NotFoundException(`Alert with id ${alertId} not found`);
        }

        return this.dataSource.transaction(async (manager) => {
            const dispositionRepo = manager.getRepository(AlertDisposition);

            const existing = await dispositionRepo.findOne({
                where: { alert: { id: alertId } },
            });

            if (existing) {
                existing.status = dto.status;
                existing.analyst = analyst;
                existing.notes = dto.notes ?? existing.notes;
                return dispositionRepo.save(existing);
            }

            try {
                const created = dispositionRepo.create({
                    alert,
                    status: dto.status,
                    analyst,
                    notes: dto.notes ?? null,
                });
                return await dispositionRepo.save(created);
            } catch (err: any) {
                if (err.code === '23505') {
                    throw new ConflictException(
                        'This alert was just dispositioned by a concurrent request. Please retry.',
                    );
                }
                throw err;
            }
        });
    }
}