import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositionsService } from './dispositions.service';
import { DispositionsController } from './dispositions.controller';
import { Alert } from '../database/entities/alert.entity';
import { AlertDisposition } from '../database/entities/alert-disposition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, AlertDisposition])],
  controllers: [DispositionsController],
  providers: [DispositionsService],
})
export class DispositionsModule { }