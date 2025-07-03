import { ChzzkChannelInfoDto } from "src/chzzk/dto/chzzk-channel-info.dto";
import { ChannelInfoDto } from './dto/channel-info.dto'
import { ChannelStateDto } from './dto/channel-state.dto'

type ChannelMeta = {
  priority?: number,
  color? : string
}


export class ChannelInfoMapper {
  static fromChzzk(
    dto: ChzzkChannelInfoDto,
    channelMeta?: ChannelMeta
  ): ChannelInfoDto {
    return {
      channelId: dto.channelId,
      platform: 'chzzk',
      detail: {
        priority: channelMeta?.priority ?? 255,
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