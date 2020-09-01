import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionIssuesEntity } from './TransactionIssues.entity';
import { AuthnetService } from '../authnet/authnet.service';

@Injectable()
export class TransactionsIssuesService {
  constructor(
    @InjectRepository(TransactionIssuesEntity)
    private transactionIssuesEntity: Repository<TransactionIssuesEntity>,
    private readonly authnetService: AuthnetService,
  ) {}

  async findAll(skip = 0, take = 100): Promise<TransactionIssuesEntity[]> {
    return this.transactionIssuesEntity.find({
      skip,
      take,
    });
  }

  async getDetailsByDbId(id: number): Promise<any> {
    const dbTransaction = await this.transactionIssuesEntity.findOne(id);
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

  async createNewIssuesEntity(
    id: number | string,
    issue: Error,
  ): Promise<void> {
    const newTransactionIssue = new TransactionIssuesEntity();
    newTransactionIssue.issueObject = issue;
    newTransactionIssue.transactionId = id.toString();
    await this.transactionIssuesEntity.save(newTransactionIssue);
  }
}
