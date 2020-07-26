import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './User.entity';
import { Repository } from 'typeorm';
import { UserCredentialsDto } from './dtos';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(newUser: UserCredentialsDto): Promise<void> {
    const user = new User();
    user.email = newUser.email.trim();
    user.password = await bcrypt.hash(newUser.password, BCRYPT_SALT_ROUNDS);
    await this.userRepository.save(user);
  }

  async findUsingCredentials(
    email: string,
    pass: string,
  ): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return;
    }
    const isValid = await bcrypt.compare(pass, user.password);
    if (isValid) {
      return user;
    }
    return;
  }
}
