import { Injectable } from '@nestjs/common'
import { ChannelService } from '../channel/channel.service'
import { Pageable } from '../commons/dto/page.dto'
import { channelInfoDtoMadeMinimal, compareDataToChangeDto, projectChannelInfoForCompare } from './device.util'
import { ChannelInfoChangeDto } from '../message-dispatcher/dto/channel-info-change.dto'
import { getUpdatedFields } from '../commons/utils/diff.util'
import { MessageDispatcherService } from 'src/message-dispatcher/message-dispatcher.service'

@Injectable()
export class DeviceService {
  constructor(
    private readonly channelService: ChannelService,
    messageDispatcherService: MessageDispatcherService,
  ) {
    channelService
      .channelChangeSubscribe(projectChannelInfoForCompare)
      .subscribe(({changed, previous}) => {
        const previousMap = new Map<string, ChannelInfoChangeDto>( previous.map(before => [ before.channelId, compareDataToChangeDto(before) ]) )
        changed
          .map(after => ({
            channelId: after.channelId,
            after: compareDataToChangeDto(after),
            before: previousMap.get(after.channelId)!,
          }))
          .map(({ channelId, before, after}) => ({
            channelId,
            diff: getUpdatedFields(before, after)
          }))
          .forEach(({ channelId, diff}) => {
            messageDispatcherService.notifyChannelInfoChange(channelId, diff)
          })
      })
  }

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