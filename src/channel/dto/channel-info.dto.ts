import { LiveStateDto } from "./live-state.dto";
import { ChannelDetailDto } from './channel-detail.dto'

export interface ChannelInfoDto {
  channelId: string
  platform: string,
  detail: ChannelDetailDto,
  liveState: LiveStateDto,
}