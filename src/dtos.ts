import { ApiProperty } from '@nestjs/swagger';

export class OperationResultDto {
  @ApiProperty()
  message?: string;

  @ApiProperty()
  error?: string;
}

export class WebhookResultDto {
  @ApiProperty()
  status: string;
  @ApiProperty()
  err?: string;
}
