import { Injectable } from '@nestjs/common';
import { ChannelEntity } from './channel.entity'
import { FindManyOptions, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm';
import { Pageable } from '../commons/types/database'
import { calcPagination } from '../commons/utils/database.util'
import { ChannelDto } from './dto/channel.dto'

@Injectable()
export class ChannelRepository {
  private readonly orderByPriority: FindManyOptions<ChannelEntity> = { order: { priority: 'ASC' } }

  constructor(
    @InjectRepository(ChannelEntity) private readonly repository: Repository<ChannelEntity>,
  ) {}

  async getChannels(pageable?: Pageable) {
    const channelEntities = await this.repository.find({ ...calcPagination(pageable), ...this.orderByPriority })

    return channelEntities.map(entity => entity.toDto())
  }

  async getChannelById(channelId: string) {
    return this.repository.findOne({ where: { channelId } })
  }

  async getChannelIds(pageable?: Pageable) {
    const channelEntities = await this.repository.find({
      select: { channelId: true },
      ...calcPagination(pageable),
      ...this.orderByPriority,
    })

    return channelEntities.map(channel => channel.channelId)
  }

  async getPriorityMap() {
    const channelEntities = await this.repository.find({
      select: { channelId: true, priority: true },
    })

    return new Map(
      channelEntities.map(entity => [entity.channelId, entity.priority])
    )
  }

  async saveChannel(channel: ChannelDto) {
    await this.repository.save(channel)
  }

  async deleteChannel(channelId: string) {
    await this.repository.delete(channelId)
  }
}