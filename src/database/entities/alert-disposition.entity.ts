import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Alert } from './alert.entity';

export enum DispositionStatus {
    OPEN = 'open',
    REVIEWED = 'reviewed',
    FALSE_POSITIVE = 'false_positive',
    ESCALATED = 'escalated',
}

@Entity('alert_dispositions')
export class AlertDisposition {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Alert, (alert) => alert.disposition, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'alert_id' })
    alert: Alert;

    @Column({ type: 'enum', enum: DispositionStatus, default: DispositionStatus.OPEN })
    status: DispositionStatus;

    @Column({ type: 'varchar', nullable: true })
    analyst: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}