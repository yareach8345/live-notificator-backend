import { Injectable } from '@nestjs/common'
import { ChannelService } from '../channel/channel.service'
import { Pageable } from '../commons/dto/page.dto'
import { channelInfoDtoMadeMinimal } from './device.util'

@Injectable()
export class DeviceService {
  constructor(private readonly channelService: ChannelService) {}

  async getChannels(pageable?: Pageable) {
    const result = await this.channelService.getChannels(pageable)
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

  async getChannel(channelId: string) {
    const result = await this.channelService.getChannel(channelId)
    return channelInfoDtoMadeMinimal(result)
  }
}