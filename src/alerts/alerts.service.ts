import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../database/entities/alert.entity';

@Injectable()
export class AlertsService {
    constructor(
        @InjectRepository(Alert)
        private readonly alertRepository: Repository<Alert>,
    ) { }

    async findAll(page: number, limit: number) {
        const [data, total] = await this.alertRepository
            .createQueryBuilder('alert')
            .leftJoinAndSelect('alert.score', 'score')
            .leftJoinAndSelect('alert.disposition', 'disposition')
            .addSelect(
                `CASE WHEN disposition.status = 'open' OR disposition.status IS NULL THEN 0 ELSE 1 END`,
                'status_priority',
            )
            .orderBy('status_priority', 'ASC')
            .addOrderBy('score.finalScore', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, limit };
    }

    async findOne(id: string): Promise<Alert> {
        const alert = await this.alertRepository
            .createQueryBuilder('alert')
            .leftJoinAndSelect('alert.score', 'score')
            .leftJoinAndSelect('alert.disposition', 'disposition')
            .leftJoinAndSelect('alert.alertTechniques', 'alertTechniques')
            .leftJoinAndSelect('alertTechniques.technique', 'technique')
            .where('alert.id = :id', { id })
            .getOne();

        if (!alert) {
            throw new NotFoundException(`Alert with id ${id} not found`);
        }

        return alert;
    }
}