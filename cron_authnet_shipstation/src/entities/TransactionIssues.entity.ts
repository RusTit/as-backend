import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['transactionId'])
export class TransactionIssuesEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'transaction_id',
  })
  transactionId!: string;

  @Column({
    name: 'issue_object',
    type: 'jsonb',
  })
  issueObject!: any;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt!: Date;
}
