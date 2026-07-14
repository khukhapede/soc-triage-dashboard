import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Alert } from './alert.entity';
import { MitreTechnique } from './mitre-technique.entity';

@Entity('alert_techniques')
export class AlertTechnique {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Alert, (alert) => alert.alertTechniques, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'alert_id' })
    alert: Alert;

    @ManyToOne(() => MitreTechnique, (technique) => technique.alertTechniques)
    @JoinColumn({ name: 'technique_id' })
    technique: MitreTechnique;
}