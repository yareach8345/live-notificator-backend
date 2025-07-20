import { ChannelDetailDto, LiveStateDto } from '../../channel/dto/channel-info.dto'

export type ChannelDetailChangeDto = Omit<ChannelDetailDto, 'channelDescription'>

export type LiveStateChangeDto = Omit<LiveStateDto, 'isOpen' | 'state' | 'tags'>

export type ChannelInfoChangeDto = ChannelDetailChangeDto & LiveStateChangeDto