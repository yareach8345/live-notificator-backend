import { Injectable } from '@nestjs/common'
import { ChannelService } from '../channel/channel.service'
import { Pageable } from '../commons/dto/page.dto'
import {
  channelInfoDtoMadeMinimal,
  liveStateDtoMadeMinimal,
} from './minimal-channel.util'
import { ChannelId } from '../commons/types/channel-id.type'

@Injectable()
export class MinimalChannelService {
  constructor(
    private readonly channelService: ChannelService,
  ) {}

  async getChannels(pageable?: Pageable, idStrings?: string[]) {
    const result = await this.channelService.getChannels(pageable, idStrings)
    return result.map(channelInfoDtoMadeMinimal)
  }

  async getOpenChannels(pageable?: Pageable) {
    const result = await this.channelService.getOpenChannels(pageable)
    return result.map(channelInfoDtoMadeMinimal)
  }

  async getCloseChannels(pageable?: Pageable) {
    const result = await this.channelService.getCloseChannels(pageable)
    return result.map(channelInfoDtoMadeMinimal)
  }

  async getChannel(channelId: ChannelId) {
    const result = await this.channelService.getChannel(channelId)
    return channelInfoDtoMadeMinimal(result)
  }

  getChannelState(channelId: ChannelId) {
    const liveState = this.channelService.getChannelState(channelId)
    return liveStateDtoMadeMinimal(liveState)
  }
}