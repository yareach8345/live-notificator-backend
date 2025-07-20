import { ChannelId } from '../../commons/types/channel-id.type'

export interface RegisterChannelDto {
  channelId: ChannelId
  priority?: number,
  color?: string
}