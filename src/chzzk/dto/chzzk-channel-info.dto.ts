import { ChzzkLiveStateDto } from "./chzzk-live-state.dto";
import { ChzzkChannelDetailDto } from './chzzk-channel-detail.dto'

export interface ChzzkChannelInfoDto {
  channelId: string
  detail: ChzzkChannelDetailDto,
  liveState: ChzzkLiveStateDto,
}