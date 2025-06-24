import { Injectable } from '@nestjs/common'
import { ChannelRepository } from './channel.repository';

@Injectable()
export class ChannelService {
  constructor(private readonly channelRepository: ChannelRepository) {}

  async getAllChannelIds() {
    return await this.channelRepository.getChannelIds()
  }

  async getChannelIdsWithPage(page: number ,pageSize: number = 10) {
    return await this.channelRepository.getChannelIds({
      page, pageSize
    })
  }
}