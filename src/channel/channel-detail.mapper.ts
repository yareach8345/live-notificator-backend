import { ChzzkChannelDetailDto } from "src/chzzk/dto/chzzk-channel-detail.dto";
import { ChannelDetailDto } from './dto/channel-detail.dto'

export class ChannelDetailMapper {
  static fromChzzk(
    dto: ChzzkChannelDetailDto,
    priority: number
  ): ChannelDetailDto {
    return {
      channelId: dto.channelId,
      platform: 'chzzk',
      priority,
      channel: { ...dto.channel },
      liveState: { ...dto.liveState },
    }
  }
}