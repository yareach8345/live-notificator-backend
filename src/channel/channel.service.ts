import { Injectable } from '@nestjs/common'
import { ChannelRepository } from './channel.repository';

@Injectable()
export class ChannelService {
  constructor(private readonly channelRepository: ChannelRepository) {}

  async getAllChannelIds() {
    const entities = await this.channelRepository.find({
      select: { channelId: true }
    })
    return entities.map(c => c.channelId)
  }

  async getChannelIdsWithPage(page: number ,pageSize: number = 10) {
    const entities = await this.channelRepository.find({
      select: { channelId: true },
      skip: (page) * pageSize,
      take: pageSize
    })
    return entities.map(c => c.channelId)
  }
}