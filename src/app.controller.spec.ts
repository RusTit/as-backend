import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/User.entity';
import { UsersService } from './users/users.service';

const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async findOne(): Promise<User | undefined> {
    return undefined;
  },
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '7d' },
        }),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        UsersService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
