import {
  Controller,
  Get,
  Post,
  Res,
  Render,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginGuard } from '../auth/login.guard';
import { UiService } from './ui.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

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
  async transactionsCreatedList() {
    const transactionList = await this.uiService.getArrayOfTransactionsCreated();
    return { transactionList };
  }

  @Get('/logout')
  logout(@Request() req, @Res() res: Response) {
    req.logout();
    res.redirect('/');
  }
}
