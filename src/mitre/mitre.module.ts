import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MitreService } from './mitre.service';
import { MitreTechnique } from '../database/entities/mitre-technique.entity';
import { AlertTechnique } from '../database/entities/alert-technique.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MitreTechnique, AlertTechnique])],
    providers: [MitreService],
    exports: [MitreService],
})
export class MitreModule { }