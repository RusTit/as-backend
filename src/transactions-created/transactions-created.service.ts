import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionCreatedEntity } from './TransactionCreated.entity';
import { AuthnetService } from '../authnet/authnet.service';

@Injectable()
export class TransactionsCreatedService {
  constructor(
    @InjectRepository(TransactionCreatedEntity)
    private transactionCreatedEntityRepository: Repository<
      TransactionCreatedEntity
    >,
    private readonly authnetService: AuthnetService,
  ) {}

  async createNew(id: string): Promise<void> {
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

  async getDetailsByDbId(id: number): Promise<any> {
    const dbTransaction = await this.transactionCreatedEntityRepository.findOne(
      id,
    );
    if (!dbTransaction) {
      throw new HttpException(
        `Transaction not found by db id: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    const result = await this.authnetService.getTransactionsDetails(
      dbTransaction.transactionId,
    );
    if (!result) {
      throw new HttpException(
        `Transaction details not found by transaction id: ${dbTransaction.transactionId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }
}
