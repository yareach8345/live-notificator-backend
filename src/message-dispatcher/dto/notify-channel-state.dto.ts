import { ChannelId } from '../../commons/types/channel-id.type'

export interface NotifyChannelStateDto {
  channelId: ChannelId,
  state: boolean | string
}