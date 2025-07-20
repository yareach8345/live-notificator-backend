import { Injectable } from '@nestjs/common';
import { ChannelEntity } from './channel.entity'
import { FindManyOptions, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm';
import { Pageable } from '../commons/dto/page.dto'
import { calcPagination, channelIdToKey } from '../commons/utils/database.util'
import { ChannelDto } from './dto/channel.dto'
import { EditChannelDto } from './dto/edit-channel.dto'
import { ChannelId } from '../commons/types/channel-id.type'

@Injectable()
export class ChannelRepository {
  private readonly orderByPriority: FindManyOptions<ChannelEntity> = { order: { priority: 'ASC' } }

  constructor(
    @InjectRepository(ChannelEntity)
    private readonly repository: Repository<ChannelEntity>,
  ) {}

  async getChannels(pageable?: Pageable) {
    const channelEntities = await this.repository.find({ ...calcPagination(pageable), ...this.orderByPriority })

    return channelEntities.map(entity => entity.toDto())
  }

  async getChannelById(channelId: string) {
    const result = await this.repository.findOne({ where: { channelId } })
    return result?.toDto()
  }

  async getChannelIds(pageable?: Pageable) {
    const channelEntities = await this.repository.find({
      select: { channelId: true },
      ...calcPagination(pageable),
      ...this.orderByPriority,
    })

    return channelEntities.map(channel => channel.channelId)
  }

  async saveChannel(channel: ChannelDto) {
    const { channelId, ...channelData } = channel
    await this.repository.save({
      ...channelIdToKey(channelId),
      ...channelData,
    })
  }

  async deleteChannel(channelId: ChannelId) {
    await this.repository.delete(channelId)
  }

  async updateChannel(channelId: ChannelId, editDto: EditChannelDto) {
    const key = channelIdToKey(channelId)
    await this.repository.update(key, editDto)

    const afterUpdate = await this.repository.findOneBy(channelId)

    return afterUpdate?.toDto()
  }

  async getChannelsByPlatform(platform: string) {
    const channels = await this.repository.findBy({ platform })

    return channels.map(channel => channel.toDto())
  }
}