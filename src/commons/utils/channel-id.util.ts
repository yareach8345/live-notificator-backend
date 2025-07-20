import { ChannelId } from '../types/channel-id.type'

export const channelIdToString = (channel: ChannelId) => `${channel.platform}-${channel.id}`
