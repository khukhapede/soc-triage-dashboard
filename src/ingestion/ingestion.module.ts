import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { Alert } from '../database/entities/alert.entity';
import { MitreModule } from '../mitre/mitre.module';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), MitreModule, ScoringModule],
  providers: [IngestionService],
})
export class IngestionModule { }