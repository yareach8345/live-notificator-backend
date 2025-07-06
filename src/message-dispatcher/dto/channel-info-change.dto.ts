import { ChannelDetailDto } from '../../channel/dto/channel-detail.dto'
import { LiveStateDto } from '../../channel/dto/live-state.dto'

// export interface ChannelInfoChangeDto {
//   detail: Omit<ChannelDetailDto, 'channelDescription'>,
//   liveState: Omit<LiveStateDto, 'isOpen' | 'state' | 'tags'>
// }
//

export type ChannelDetailChangeDto = Omit<ChannelDetailDto, 'channelDescription'>

export type LiveStateChangeDto = Omit<LiveStateDto, 'isOpen' | 'state' | 'tags'>

export type ChannelInfoChangeDto = ChannelDetailChangeDto & LiveStateChangeDto