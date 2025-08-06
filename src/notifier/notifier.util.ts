import { ChannelInfoDto } from '../channel/dto/channel-info.dto'
import { ComparableChannelInfoDto } from './dto/comparable-channel-info.dto'
import { ChannelStateDto } from '../channel/dto/channel-state.dto'

export function projectChannelInfoForCompare(channelInfoDto: ChannelInfoDto): ComparableChannelInfoDto {
  const { isOpen, state, tags, ...detectableLiveStateInfo } = { tags: undefined, ...channelInfoDto.liveState }

  const { channelDescription, ...detectableChannelDetail } = channelInfoDto.detail

  return {
    channelId: channelInfoDto.channelId,
    detail: detectableChannelDetail,
    liveState: detectableLiveStateInfo,
  }
}

export function channelInfoToChannelState(
  channelInfo: ChannelInfoDto
): ChannelStateDto {
  return {
    channelId: channelInfo.channelId,
    state: channelInfo.liveState.isOpen
  }
}