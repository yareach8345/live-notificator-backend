import { Channel, LiveStatus } from 'chzzk'
import { FetchedChannelDetailDto, FetchedLiveStateDto } from '../commons/dto/fetched-channel-info.dto'

export function getLiveStateDtoFromLiveStatus(liveStatus: LiveStatus | null): FetchedLiveStateDto {
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

export function getChannelDetailDtoFromChannelDto(channel: Channel): FetchedChannelDetailDto {
  return {
    channelImageUrl: channel.channelImageUrl,
    displayName: channel.channelName,
    channelDescription: channel.channelDescription,
    followerCount: channel.followerCount
  }
}