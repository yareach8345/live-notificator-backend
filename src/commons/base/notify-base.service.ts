import { UpdateNotifyDto } from 'src/message-dispatcher/dto/update-notify.dto'
import { ChannelStateDto } from '../../channel/dto/channel-state.dto'
import { ChannelInfoChangeDto } from '../../message-dispatcher/dto/channel-info-change.dto'
import { dateToString } from '../utils/date.util'

export abstract class NotifyBaseService{
  notifyChannelStateChange(channelState: ChannelStateDto) {
    this.notify(
      `channel/${channelState.channelId}/state`,
      channelState.state ? 'open' : 'closed',
    )
  }

  notifyChannelInfoChange(channelId: string, channelInfoChangeDto: Partial<ChannelInfoChangeDto>) {
    this.notify(
      `channel/${channelId}/info-changed`,
      JSON.stringify(channelInfoChangeDto),
    )
  }

  notifyChannelInfoUpdate(updateDto: UpdateNotifyDto) {
    const datetime = dateToString(updateDto.date)
    this.notify('updated-at', datetime)
  }

  abstract notify(topic: string, payload: string)
}