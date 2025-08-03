import { Injectable } from '@nestjs/common'
import { ChannelService } from '../channel/channel.service'
import { Pageable } from '../commons/dto/page.dto'
import {
  channelInfoDtoMadeMinimal,
  compareDataToChangeDto,
  liveStateDtoMadeMinimal,
  projectChannelInfoForCompare,
} from './minimal-channel.util'
import { ChannelInfoChangeDto } from '../message-dispatcher/dto/channel-info-change.dto'
import { getUpdatedFields } from '../commons/utils/diff.util'
import { MessageDispatcherService } from 'src/message-dispatcher/message-dispatcher.service'
import { ChannelId } from '../commons/types/channel-id.type'
import { channelIdToString } from '../commons/utils/channel-id.util'

@Injectable()
export class MinimalChannelService {
  constructor(
    private readonly channelService: ChannelService,
    messageDispatcherService: MessageDispatcherService,
  ) {
    channelService
      .channelChangeSubscribe(projectChannelInfoForCompare)
      .subscribe(({changed, previous}) => {
        const previousMap = new Map<string, ChannelInfoChangeDto>( previous.map(before => [ channelIdToString(before.channelId), compareDataToChangeDto(before) ]) )
        changed
          .map(after => ({
            channelId: after.channelId,
            after: compareDataToChangeDto(after),
            before: previousMap.get(channelIdToString(after.channelId))!,
          }))
          .map(({ channelId, before, after}) => ({
            channelId,
            diff: getUpdatedFields(before, after)
          }))
          .filter(({ diff }) => Object.keys(diff).length > 0)
          .forEach(({ channelId, diff}) => {
            messageDispatcherService.notifyChannelInfoChange(channelId, diff)
          })
      })
  }

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