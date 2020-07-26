import {
  Controller,
  Get,
  UseGuards,
  Post,
  Request,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { UserCredentialsDto } from './users/dtos';
import { AuthTokenDto } from './auth/dtos';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiOkResponse({
    description: 'Return JWT token',
    type: AuthTokenDto,
  })
  async login(@Request() req: any, @Body() body: UserCredentialsDto) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Request() req: any) {
    return req.user;
  }
}
