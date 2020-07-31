import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionProcessedEntity } from './TransactionProcessed.entity';
import { AuthnetService } from '../authnet/authnet.service';

@Injectable()
export class TransactionsProcessedService {
  constructor(
    @InjectRepository(TransactionProcessedEntity)
    private transactionProcessedEntity: Repository<TransactionProcessedEntity>,
    private readonly authnetService: AuthnetService,
  ) {}

  async findAll(skip = 0, take = 100): Promise<TransactionProcessedEntity[]> {
    return this.transactionProcessedEntity.find({
      skip,
      take,
    });
  }

  async getDetailsByDbId(id: number): Promise<any> {
    const dbTransaction = await this.transactionProcessedEntity.findOne(id);
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
