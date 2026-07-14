import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { Alert } from '../database/entities/alert.entity';
import { MitreModule } from '../mitre/mitre.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), MitreModule],
  providers: [IngestionService],
})
export class IngestionModule {}