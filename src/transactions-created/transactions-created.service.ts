import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionCreatedEntity } from './TransactionCreated.entity';
import { AuthnetService } from '../authnet/authnet.service';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';

@Injectable()
export class TransactionsCreatedService {
  constructor(
    @InjectRepository(TransactionCreatedEntity)
    private readonly transactionCreatedEntityRepository: Repository<
      TransactionCreatedEntity
    >,
    @InjectRepository(TransactionProcessedEntity)
    private readonly transactionProcessedEntityRepository: Repository<
      TransactionProcessedEntity
    >,
    private readonly authnetService: AuthnetService,
  ) {}

  async createNew(id: string): Promise<void> {
    const { NODE_ENV } = process.env;
    if (NODE_ENV === 'test') {
      return;
    }
    const [existingDbRow, duplicatedDbRow] = await Promise.all([
      this.transactionCreatedEntityRepository.findOne({
        where: {
          transactionId: id,
        },
        select: ['id'],
      }),
      this.transactionProcessedEntityRepository.findOne({
        where: {
          transactionId: id,
        },
        select: ['id'],
      }),
    ]);
    if (existingDbRow) {
      Logger.warn(`Transaction with id: ${id} already exist`);
    }
    if (duplicatedDbRow) {
      Logger.warn(`Transaction with id: ${id} already processed`);
    } else {
      const transactionDetails = await this.authnetService.getTransactionsDetails(
        id,
      );
      const newDbRow = new TransactionCreatedEntity();
      newDbRow.transactionId = id;
      newDbRow.price = transactionDetails.settleAmount;
      newDbRow.customerEmail = transactionDetails.customer?.email;
      newDbRow.customerName = `${transactionDetails.billTo.firstName} ${transactionDetails.billTo.lastName}`;
      newDbRow.orderDescription = transactionDetails.order?.description;
      newDbRow.orderNumber = transactionDetails.order?.invoiceNumber;
      await this.transactionCreatedEntityRepository.save(newDbRow);
    }
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
