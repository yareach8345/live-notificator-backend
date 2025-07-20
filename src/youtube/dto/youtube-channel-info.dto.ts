import { YoutubeLiveStateDto } from "./youtube-live-state.dto";
import { YoutubeChannelDetailDto } from './youtube-channel-detail.dto'

export interface YoutubeChannelInfoDto {
  channelId: string
  detail: YoutubeChannelDetailDto,
  liveState: YoutubeLiveStateDto,
}