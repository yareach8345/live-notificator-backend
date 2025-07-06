import { Channel, LiveStatus } from 'chzzk'
import { ChzzkLiveStateDto } from './dto/chzzk-live-state.dto'
import { ChzzkChannelDetailDto } from './dto/chzzk-channel-detail.dto'

export function getLiveStateDtoFromLiveStatus(liveStatus: LiveStatus | null): ChzzkLiveStateDto {
  if(liveStatus === null) {
    return {
      state: 'notFound',
      isOpen: false,
    }
  }

  if(liveStatus.status === "OPEN") {
    return {
      state: 'open',
      isOpen: true,
      liveTitle: liveStatus.liveTitle,
      concurrentUserCount: liveStatus.concurrentUserCount,
      tags: liveStatus.tags,
      category: liveStatus.liveCategory ?? ""
    }
  } else {
    return {
      state: 'closed',
      isOpen: false,
    }
  }
}

export function getChannelDetailDtoFromChannelDto(channel: Channel): ChzzkChannelDetailDto {
  return {
    channelImageUrl: channel.channelImageUrl,
    displayName: channel.channelName,
    channelDescription: channel.channelDescription,
    followerCount: channel.followerCount
  }
}