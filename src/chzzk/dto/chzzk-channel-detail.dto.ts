import { ChzzkLiveStateDto } from "./chzzk-live-state.dto";
import { ChzzkChannelInfoDto } from './chzzk-channel-info.dto'

export interface ChzzkChannelDetailDto {
  channelId: string
  channel: ChzzkChannelInfoDto,
  liveState: ChzzkLiveStateDto,
}