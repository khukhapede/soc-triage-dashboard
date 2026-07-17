import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DispositionStatus } from '../../database/entities/alert-disposition.entity';

export class CreateDispositionDto {
    @IsEnum(DispositionStatus)
    status: DispositionStatus;

    @IsOptional()
    @IsString()
    analyst?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}