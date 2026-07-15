import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringService } from './scoring.service';
import { Alert } from '../database/entities/alert.entity';
import { AlertScore } from '../database/entities/alert-score.entity';
import { AlertTechnique } from '../database/entities/alert-technique.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Alert, AlertScore, AlertTechnique])],
    providers: [ScoringService],
    exports: [ScoringService],
})
export class ScoringModule { }