import { ChannelDetailDto } from '../../channel/dto/channel-detail.dto'
import { LiveStateDto } from '../../channel/dto/live-state.dto'

export interface ChannelInfoChangeDto {
  channelId: string,
  detail: Omit<ChannelDetailDto, 'channelDescription'>,
  liveState: Omit<LiveStateDto, 'isOpen' | 'state' | 'tags'>
}