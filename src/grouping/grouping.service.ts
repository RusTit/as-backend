import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from './Group.entity';
import { Repository } from 'typeorm';
import { GroupNewDto, GroupingEditDto } from './dtos';

function setFieldsFromThePayload(
  groupNewDto: GroupNewDto,
  dbRow: GroupEntity,
): GroupEntity {
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
    const newDbRow = setFieldsFromThePayload(groupNewDto, new GroupEntity());
    await this.groupEntityRepository.save(newDbRow);
  }

  async findById(id: number): Promise<GroupEntity> {
    return this.groupEntityRepository.findOne(id);
  }

  async updateGroupingData(
    id: number,
    groupingEditDto: GroupingEditDto,
  ): Promise<GroupEntity | null> {
    const dbEntity = await this.groupEntityRepository.findOne(id);
    if (!dbEntity) {
      return dbEntity;
    }
    setFieldsFromThePayload(groupingEditDto, dbEntity);
    await this.groupEntityRepository.save(dbEntity);
    return dbEntity;
  }

  async deleteGroupById(id: number): Promise<boolean> {
    const dbEntity = await this.groupEntityRepository.findOne(id);
    if (!dbEntity) {
      return false;
    }
    await this.groupEntityRepository.remove(dbEntity);
    return true;
  }
}
