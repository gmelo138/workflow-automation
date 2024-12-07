import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('workflows')
export class WorkflowEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  trigger: {
    type: string;
    params: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  actions?: { type: string; params: Record<string, any> }[];

  @Column({ type: 'jsonb', nullable: true })
  lastExecutionState?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
