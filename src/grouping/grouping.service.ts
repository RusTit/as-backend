import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from './Group.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupingService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupEntityRepository: Repository<GroupEntity>,
  ) {}

  async findAll(skip = 0, take = 100): Promise<GroupEntity[]> {
    return this.groupEntityRepository.find({
      skip,
      take,
    });
  }
}
