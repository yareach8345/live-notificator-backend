import { ChannelDetailChangeDto, LiveStateChangeDto } from '../../message-dispatcher/dto/channel-info-change.dto'

export interface ComparableChannelInfoDto {
  channelId: string,
  detail: ChannelDetailChangeDto,
  liveState: LiveStateChangeDto,
}