import { UpdateNotifyDto } from 'src/message-dispatcher/dto/update-notify.dto'
import { ChannelInfoChangeDto } from '../../message-dispatcher/dto/channel-info-change.dto'
import { dateToString } from '../utils/date.util'
import { NotifyChannelStateDto } from '../../message-dispatcher/dto/notify-channel-state.dto'
import { ChannelId } from '../types/channel-id.type'

export abstract class NotifyBaseService{
  notifyChannelStateChange(channelState: NotifyChannelStateDto) {
    const state = typeof channelState.state === 'boolean'
      ? (channelState.state ? 'open' : 'closed')
      : channelState.state

    this.notify(
      `channel/${channelState.channelId.platform}/${channelState.channelId.id}/state`,
      state
    )
  }

  notifyChannelInfoChange(channelId: ChannelId, channelInfoChangeDto: Partial<ChannelInfoChangeDto>) {
    this.notify(
      `channel/${channelId.platform}/${channelId.id}/info-changed`,
      JSON.stringify(channelInfoChangeDto),
    )
  }

  notifyChannelInfoUpdate(updateDto: UpdateNotifyDto) {
    const datetime = dateToString(updateDto.date)
    this.notify('updated-at', datetime)
  }

  abstract notify(topic: string, payload: string): void
}