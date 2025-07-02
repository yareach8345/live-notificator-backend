import { ChannelDetailDto } from '../channel/dto/channel-detail.dto'
import { ChannelImageDto } from './dto/channel-image.dto'

export const channelDetailToChannelImage = (channelDetail: ChannelDetailDto): ChannelImageDto => ({
  channelId: channelDetail.channelId,
  imageUrl: channelDetail.channel.channelImageUrl
})