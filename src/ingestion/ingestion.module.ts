import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { Alert } from '../database/entities/alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  providers: [IngestionService],
})
export class IngestionModule { }