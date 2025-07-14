import { ChannelDetailDto } from '../../channel/dto/channel-detail.dto'
import { LiveStateDto } from '../../channel/dto/live-state.dto'

export type ChannelDetailChangeDto = Omit<ChannelDetailDto, 'channelDescription'>

export type LiveStateChangeDto = Omit<LiveStateDto, 'isOpen' | 'state' | 'tags'>

export type ChannelInfoChangeDto = ChannelDetailChangeDto & LiveStateChangeDto