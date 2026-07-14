import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Alert } from './alert.entity';

@Entity('alert_scores')
export class AlertScore {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Alert, (alert) => alert.score, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'alert_id' })
    alert: Alert;

    @Column({ type: 'float' })
    severityScore: number;

    @Column({ type: 'float' })
    techniqueScore: number;

    @Column({ type: 'float' })
    frequencyScore: number;

    @Column({ type: 'float' })
    finalScore: number;
}