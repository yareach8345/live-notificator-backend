import { LiveStateDto } from "./live-state.dto";
import { ChannelInfoDto } from './channel-info.dto'

export interface ChannelDetailDto {
  channelId: string
  channel: ChannelInfoDto,
  liveState: LiveStateDto,
}