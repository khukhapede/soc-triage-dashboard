import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    OneToOne,
    CreateDateColumn,
} from 'typeorm';
import { AlertTechnique } from './alert-technique.entity';
import { AlertScore } from './alert-score.entity';
import { AlertDisposition } from './alert-disposition.entity';

@Entity('alerts')
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    ruleId: number;

    @Column({ type: 'int' })
    ruleLevel: number;

    @Column({ type: 'text', nullable: true })
    ruleDescription: string;

    @Column({ type: 'jsonb' })
    rawPayload: Record<string, any>; // full original alert JSON, for debugging/replay

    @Column({ type: 'varchar', nullable: true })
    agentName: string;

    @Column({ type: 'timestamptz', nullable: true })
    alertTime: Date; // when Wazuh generated it

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date; // when we ingested it

    @OneToMany(() => AlertTechnique, (at) => at.alert)
    alertTechniques: AlertTechnique[];

    @OneToOne(() => AlertScore, (score) => score.alert)
    score: AlertScore;

    @OneToOne(() => AlertDisposition, (disposition) => disposition.alert)
    disposition: AlertDisposition;
}