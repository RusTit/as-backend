import { Controller, Get, Post, Res, Render, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { LoginGuard } from '../auth/login.guard';

@Controller('ui')
export class UiController {
  @Get(['/', '/login'])
  @Render('login')
  index() {
    return;
  }

  @UseGuards(LoginGuard)
  @Post(['/', '/login'])
  login(@Res() res: Response) {
    res.redirect('/home');
  }
}
