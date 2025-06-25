import { LiveStateDto } from "./live-state.dto";
import { ChannelInfoDto } from './channel-info.dto'

export interface ChannelDetailDto {
  channel: ChannelInfoDto,
  liveState: LiveStateDto,
}