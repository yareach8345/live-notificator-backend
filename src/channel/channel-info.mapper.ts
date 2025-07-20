import { FetchedChannelInfoDto } from "src/commons/dto/fetched-channel-info.dto";
import { ChannelInfoDto } from './dto/channel-info.dto'
import { ChannelStateDto } from './dto/channel-state.dto'

type ChannelMeta = {
  priority?: number,
  color? : string
}


export class ChannelInfoMapper {
  static fromFetchedChannelInfoDto(
    dto: FetchedChannelInfoDto,
    channelMeta?: ChannelMeta
  ): ChannelInfoDto {
    return {
      channelId: {
        id: dto.channelId.id,
        platform: dto.channelId.platform,
      },
      detail: {
        priority: channelMeta?.priority,
        color: channelMeta?.color,
        ...dto.detail
      },
      liveState: { ...dto.liveState },
    }
  }

  static toChannelState(
    channelInfo: ChannelInfoDto
  ): ChannelStateDto {
    return {
      channelId: channelInfo.channelId,
      state: channelInfo.liveState.isOpen
    }
  }
}