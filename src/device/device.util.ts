import { MinimalChannelInfoDto, MinimalLiveStateDto } from './dto/minimal-channel-info.dto'
import { ChannelInfoDto } from '../channel/dto/channel-info.dto'

export function channelInfoDtoMadeMinimal({channelId, detail, liveState} : ChannelInfoDto): MinimalChannelInfoDto {
  const minimalLiveState: MinimalLiveStateDto =
    liveState.isOpen
    ? {
        isOpen: true,
        liveTitle: liveState.liveTitle,
        concurrentUserCount: liveState.concurrentUserCount,
        category: liveState.category,
      }
    : {
        isOpen: false
      }

  return {
    channelId,
    detail: {
      displayName: detail.displayName,
      followerCount: detail.followerCount,
      priority: detail.priority,
    },
    liveState: minimalLiveState,
  }
}