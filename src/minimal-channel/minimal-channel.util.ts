import { MinimalChannelInfoDto, MinimalLiveStateDto } from './dto/minimal-channel-info.dto'
import { ChannelInfoDto } from '../channel/dto/channel-info.dto'
import { ChannelInfoChangeDto } from '../message-dispatcher/dto/channel-info-change.dto'
import { ComparableChannelInfoDto } from './dto/comparable-channel-info.dto'

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