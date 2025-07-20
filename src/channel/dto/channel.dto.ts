import { ChannelId } from '../../commons/types/channel-id.type'

export interface ChannelDto {
  channelId: ChannelId,
  displayName: string
  priority?: number
  color?: string
}