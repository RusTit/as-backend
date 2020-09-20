import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemHealthEntity } from './SystemHealth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SystemHealthService {
  constructor(
    @InjectRepository(SystemHealthEntity)
    private readonly systemHealthEntityRepository: Repository<
      SystemHealthEntity
    >,
  ) {}

  async findAll(skip = 0, take = 100): Promise<SystemHealthEntity[]> {
    return this.systemHealthEntityRepository.find({
      skip,
      take,
      order: {
        id: 'DESC',
      },
    });
  }
}
