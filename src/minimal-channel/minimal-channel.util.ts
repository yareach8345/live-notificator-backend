import { MinimalChannelInfoDto, MinimalLiveStateDto } from './dto/minimal-channel-info.dto'
import { ChannelInfoDto, LiveStateDto } from '../channel/dto/channel-info.dto'
import { ChannelInfoChangeDto } from '../message-dispatcher/dto/channel-info-change.dto'
import { ComparableChannelInfoDto } from './dto/comparable-channel-info.dto'

export const liveStateDtoMadeMinimal = (liveState: LiveStateDto): MinimalLiveStateDto => {
  return liveState.isOpen
    ? {
      isOpen: true,
      liveTitle: liveState.liveTitle,
      concurrentUserCount: liveState.concurrentUserCount,
      category: liveState.category,
    }
    : {
      isOpen: false
    }
}

export function channelInfoDtoMadeMinimal({channelId, detail, liveState} : ChannelInfoDto): MinimalChannelInfoDto {
  const minimalLiveState: MinimalLiveStateDto = liveStateDtoMadeMinimal(liveState)

  return {
    channelId: channelId,
    detail: {
      displayName: detail.displayName,
      followerCount: detail.followerCount,
      priority: detail.priority,
      color: detail.color,
    },
    liveState: minimalLiveState,
  }
}

export function projectChannelInfoForCompare(channelInfoDto: ChannelInfoDto): ComparableChannelInfoDto {
  const { isOpen, state, tags, ...detectableLiveStateInfo } = { tags: undefined, ...channelInfoDto.liveState }

  const { channelDescription, ...detectableChannelDetail } = channelInfoDto.detail

  return {
    channelId: channelInfoDto.channelId,
    detail: detectableChannelDetail,
    liveState: detectableLiveStateInfo,
  }
}

export function compareDataToChangeDto(comparableChannelInfoDto: ComparableChannelInfoDto): ChannelInfoChangeDto {
  const { channelId, detail, liveState } = comparableChannelInfoDto
  void channelId
  return {
    ...detail,
    ...liveState,
  }
}