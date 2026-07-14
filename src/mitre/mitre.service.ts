import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MitreTechnique } from '../database/entities/mitre-technique.entity';
import { AlertTechnique } from '../database/entities/alert-technique.entity';
import { Alert } from '../database/entities/alert.entity';

@Injectable()
export class MitreService {
    private readonly logger = new Logger(MitreService.name);

    constructor(
        @InjectRepository(MitreTechnique)
        private readonly techniqueRepository: Repository<MitreTechnique>,
        @InjectRepository(AlertTechnique)
        private readonly alertTechniqueRepository: Repository<AlertTechnique>,
    ) { }

    async mapAlertTechniques(alert: Alert, rawAlert: any): Promise<void> {
        const mitreIds: string[] = rawAlert?.rule?.mitre?.id ?? [];

        if (!Array.isArray(mitreIds) || mitreIds.length === 0) {
            return;
        }

        for (const techniqueId of mitreIds) {
            const technique = await this.techniqueRepository.findOne({
                where: { techniqueId },
            });

            if (!technique) {
                this.logger.warn(`No matching technique found for MITRE ID: ${techniqueId}`);
                continue;
            }

            const link = this.alertTechniqueRepository.create({
                alert,
                technique,
            });

            await this.alertTechniqueRepository.save(link);
            this.logger.log(`Linked alert ${alert.id} to technique ${techniqueId}`);
        }
    }
}