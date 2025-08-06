import { ChannelDetailChangeDto, LiveStateChangeDto } from '../../message-dispatcher/dto/channel-info-change.dto'
import { ChannelId } from '../../commons/types/channel-id.type'

export interface ComparableChannelInfoDto {
  channelId: ChannelId,
  detail: ChannelDetailChangeDto,
  liveState: LiveStateChangeDto,
}