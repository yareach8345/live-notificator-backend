import { ChannelDetailChangeDto, LiveStateChangeDto } from '../../mqtt/dto/channel-info-change.dto'

export interface ComparableChannelInfoDto {
  channelId: string,
  detail: ChannelDetailChangeDto,
  liveState: LiveStateChangeDto,
}