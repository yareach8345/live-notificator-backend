import { ChannelId } from '../types/channel-id.type'

export const calcHashMapKey = (channel: Record<'channelId', ChannelId>) => `${channel.channelId.platform}-${channel.channelId.id}`
