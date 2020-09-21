import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from './Group.entity';
import { Repository } from 'typeorm';
import { GroupNewDto } from './dtos';

function setFields(groupNewDto: GroupNewDto, dbRow: GroupEntity): GroupEntity {
  dbRow.name = groupNewDto.name;
  dbRow.productNameGlob = groupNewDto.productNameGlob;
  dbRow.productSkuGlob = groupNewDto.productSkuGlob;
  dbRow.customName = groupNewDto.customName;
  dbRow.fieldName = groupNewDto.fieldName;
  return dbRow;
}
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

  async createNewGroup(groupNewDto: GroupNewDto): Promise<void> {
    const newDbRow = setFields(groupNewDto, new GroupEntity());
    await this.groupEntityRepository.save(newDbRow);
  }
}
