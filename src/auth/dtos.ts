import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenDto {
  @ApiProperty()
  access_token!: string;
}

export type JwtPayload = {
  id: number;
  timestamp: Date;
};
