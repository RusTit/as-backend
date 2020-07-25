import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionCreatedEntity } from './TransactionCreated.entity';

@Injectable()
export class TransactionsCreatedService {
  constructor(
    @InjectRepository(TransactionCreatedEntity)
    private transactionCreatedEntityRepository: Repository<
      TransactionCreatedEntity
    >,
  ) {}

  async createNew(id: string) {
    const newDbRow = new TransactionCreatedEntity();
    newDbRow.transactionId = id;
    await this.transactionCreatedEntityRepository.save(newDbRow);
  }

  async findAll(skip = 0, take = 100): Promise<TransactionCreatedEntity[]> {
    return this.transactionCreatedEntityRepository.find({
      skip,
      take,
    });
  }
}
