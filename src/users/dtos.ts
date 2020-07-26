import { ApiProperty } from '@nestjs/swagger';

export class UserCredentialsDto {
  @ApiProperty({
    required: true,
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    required: true,
    minLength: 6,
  })
  password!: string;
}
