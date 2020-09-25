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
export class TransactionCreatedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'transaction_id',
  })
  transactionId!: string;

  @Column({
    type: 'float',
    nullable: true,
  })
  price?: number;

  @Column({
    nullable: true,
    name: 'customer_name',
  })
  customerName?: string;

  @Column({
    nullable: true,
    name: 'customer_email',
  })
  customerEmail?: string;

  @Column({
    nullable: true,
    name: 'order_number',
  })
  orderNumber?: string;

  @Column({
    nullable: true,
    name: 'order_description',
  })
  orderDescription?: string;

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
