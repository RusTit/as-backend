import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionIssuesEntity } from './TransactionIssues.entity';
import { AuthnetService } from '../authnet/authnet.service';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';

@Injectable()
export class TransactionsIssuesService {
  constructor(
    @InjectRepository(TransactionIssuesEntity)
    private transactionIssuesEntity: Repository<TransactionIssuesEntity>,
    private readonly authnetService: AuthnetService,
    private readonly transactionsCreatedService: TransactionsCreatedService,
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

  async deleteTransactionById(id: number): Promise<boolean> {
    const dbEntity = await this.transactionIssuesEntity.findOne(id);
    if (!dbEntity) {
      return false;
    }
    await this.transactionIssuesEntity.remove(dbEntity);
    return true;
  }

  async restoreTransactionById(id: number): Promise<void> {
    const transactionDbEntity = await this.transactionIssuesEntity.findOne(id);
    if (transactionDbEntity) {
      await this.transactionsCreatedService.createNew(
        transactionDbEntity.transactionId,
      );
      await this.transactionIssuesEntity.remove(transactionDbEntity);
    }
  }
}
