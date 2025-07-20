import { ChannelId } from '../../commons/types/channel-id.type'

export interface ChannelStateDto {
  channelId: ChannelId,
  state: boolean
}