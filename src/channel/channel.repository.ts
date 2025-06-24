import { Injectable } from '@nestjs/common';
import { ChannelEntity } from './channel.entity'
import { DataSource, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm';
import { Pageable } from '../commons/types/database'
import { calcPagination } from '../commons/utils/database.util'

@Injectable()
export class ChannelRepository {
  constructor(
    @InjectRepository(ChannelEntity) private readonly repository: Repository<ChannelEntity>,
  ) {}

  async getChannelIds(pageable?: Pageable) {
    const channelEntities = await this.repository.find({
      select: { channelId: true },
      ...calcPagination(pageable),
    })

    return channelEntities.map(channel => channel.channelId)
  }
}