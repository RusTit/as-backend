import {
  Controller,
  Get,
  Post,
  Res,
  Render,
  UseGuards,
  Request,
  Query,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginGuard } from '../auth/login.guard';
import { UiService } from './ui.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { ListTransactionsQuery } from './dtos';
import { ListProductsQuery } from '../products/dtos';

@Controller('ui')
export class UiController {
  constructor(private readonly uiService: UiService) {}

  @Get(['/', '/login'])
  @Render('login')
  index() {
    return;
  }

  @UseGuards(LoginGuard)
  @Post(['/', '/login'])
  login(@Res() res: Response) {
    res.redirect('/ui/transactions-created');
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/transactions-created')
  @Render('transactions-created')
  async transactionsCreatedList(@Query() options?: ListTransactionsQuery) {
    const transactionList = await this.uiService.getArrayOfTransactionsCreated(
      options,
    );
    return { transactionList };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/transactions-issues')
  @Render('transactions-issues')
  async transactionsIssuesList(@Query() options?: ListTransactionsQuery) {
    const transactionList = await this.uiService.getArrayOfTransactionsIssues(
      options,
    );
    return { transactionList };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/transactions-processed')
  @Render('transactions-processed')
  async transactionsProcessedList(@Query() options?: ListTransactionsQuery) {
    const transactionList = await this.uiService.getArrayOfTransactionsProcessed(
      options,
    );
    return { transactionList };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/products')
  @Render('products')
  async productsList(@Query() options?: ListProductsQuery) {
    const productsList = await this.uiService.getArrayOfProducts(options);
    return {
      productsList,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/products/new')
  @Render('products/newProduct')
  async createNewProduct() {
    return;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/products/:id')
  @Render('products/editProduct')
  async getProductItem(@Param('id') id: number) {
    const product = await this.uiService.getProductById(id);
    if (!product) {
      throw new HttpException(
        `Product not found by db id: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      product,
    };
  }

  @Get('/logout')
  logout(@Request() req, @Res() res: Response) {
    req.logout();
    res.redirect('/');
  }
}
