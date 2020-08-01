import { Controller, Get, Post, Res, Render } from '@nestjs/common';
import { Response } from 'express';

@Controller('ui')
export class UiController {
  @Get('/')
  @Render('index')
  index() {
    return;
  }
}
