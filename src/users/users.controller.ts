import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCredentialsDto, OperationResultDto } from './dtos';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @ApiCreatedResponse({
    status: 201,
    description: 'User was created successfully',
    type: OperationResultDto,
  })
  @HttpCode(201)
  async register(
    @Body() newUser: UserCredentialsDto,
  ): Promise<OperationResultDto> {
    await this.usersService.create(newUser);
    return {
      success: true,
      message: 'User was created',
    };
  }
}
