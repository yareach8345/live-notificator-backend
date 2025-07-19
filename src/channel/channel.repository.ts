import { Injectable } from '@nestjs/common';
import { ChannelEntity } from './channel.entity'
import { FindManyOptions, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm';
import { Pageable } from '../commons/dto/page.dto'
import { calcPagination } from '../commons/utils/database.util'
import { ChannelDto } from './dto/channel.dto'
import { EditChannelDto } from './dto/edit-channel.dto'

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
    await this.repository.save(channel)
  }

  async deleteChannel(channelId: string) {
    await this.repository.delete(channelId)
  }

  async updateChannel(channelId: string, editDto: EditChannelDto) {
    await this.repository.update(channelId, editDto)

    const afterUpdate = await this.repository.findOneBy({ channelId })

    return afterUpdate?.toDto()
  }
}