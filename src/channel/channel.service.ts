import { Injectable } from '@nestjs/common'
import { ChannelRepository } from './channel.repository';
import { Pageable } from 'src/commons/types/database';

@Injectable()
export class ChannelService {
  constructor(private readonly channelRepository: ChannelRepository) {}

  async getAllChannelIds() {
    return await this.channelRepository.getChannelIds()
  }

  async getChannelIdsWithPage(pageable?: Pageable) {
    return await this.channelRepository.getChannelIds(pageable)
  }
}