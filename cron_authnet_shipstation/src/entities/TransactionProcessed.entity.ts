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
export class TransactionProcessedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'transaction_id',
  })
  transactionId!: string;

  @Column({
    name: 'order_object',
    type: 'jsonb',
  })
  orderObject!: any;

  @Column({
    name: 'label_object',
    type: 'jsonb',
  })
  labelObject!: any;

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
