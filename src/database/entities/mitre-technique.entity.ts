import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AlertTechnique } from './alert-technique.entity';

@Entity('mitre_techniques')
export class MitreTechnique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  techniqueId: string; // e.g. "T1110" — the actual MITRE ATT&CK ID

  @Column({ type: 'varchar' })
  tactic: string; // e.g. "Credential Access"

  @Column({ type: 'varchar' })
  name: string; // e.g. "Brute Force"

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => AlertTechnique, (at) => at.technique)
  alertTechniques: AlertTechnique[];
}