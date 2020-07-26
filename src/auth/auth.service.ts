import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/User.entity';
import { JwtPayload } from './JwtPayload';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, pass: string): Promise<User | undefined> {
    const user = await this.usersService.findUsingCredentials(email, pass);
    return user;
  }

  async login(user: User) {
    const payload = { id: user.id, timestamp: new Date() } as JwtPayload;
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
