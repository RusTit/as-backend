import { Injectable } from '@nestjs/common';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { TransactionCreatedEntity } from '../transactions-created/TransactionCreated.entity';
import { TransactionsIssuesService } from '../transactions-issues/transactions-issues.service';
import { TransactionIssuesEntity } from '../transactions-issues/TransactionIssues.entity';
import { TransactionsProcessedService } from '../transactions-processed/transactions-processed.service';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';
import { ListTransactionsQuery } from './dtos';
import { ProductsService } from '../products/products.service';
import { ProductEntity } from '../products/Product.entity';
import { ListProductsQuery } from '../products/dtos';
import { ListGroupingQuery } from '../grouping/dtos';
import { GroupingService } from '../grouping/grouping.service';
import { GroupEntity } from '../grouping/Group.entity';

@Injectable()
export class UiService {
  constructor(
    private readonly transactionsCreatedService: TransactionsCreatedService,
    private readonly transactionsIssuesService: TransactionsIssuesService,
    private readonly transactionsProcessedService: TransactionsProcessedService,
    private readonly productsService: ProductsService,
    private readonly groupingService: GroupingService,
  ) {}

  async getArrayOfGroups(options?: ListGroupingQuery): Promise<GroupEntity[]> {
    return this.groupingService.findAll(options.skip, options.take);
  }

  async getArrayOfProducts(
    options?: ListProductsQuery,
  ): Promise<ProductEntity[]> {
    return this.productsService.findAll(options.skip, options.take);
  }

  async getArrayOfTransactionsCreated(
    options?: ListTransactionsQuery,
  ): Promise<TransactionCreatedEntity[]> {
    return this.transactionsCreatedService.findAll(options.skip, options.take);
  }

  async getArrayOfTransactionsProcessed(
    options?: ListTransactionsQuery,
  ): Promise<TransactionProcessedEntity[]> {
    return this.transactionsProcessedService.findAll(
      options.skip,
      options.take,
    );
  }

  async getArrayOfTransactionsIssues(
    options?: ListTransactionsQuery,
  ): Promise<TransactionIssuesEntity[]> {
    return this.transactionsIssuesService.findAll(options.skip, options.take);
  }

  async getProductById(id: number): Promise<ProductEntity> {
    return this.productsService.findById(id);
  }
}
