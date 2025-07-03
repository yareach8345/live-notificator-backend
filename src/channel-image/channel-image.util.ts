import { ChannelInfoDto } from '../channel/dto/channel-info.dto'
import { ChannelImageDto } from './dto/channel-image.dto'

export const channelInfoToChannelImage = (channelInfo: ChannelInfoDto): ChannelImageDto => ({
  channelId: channelInfo.channelId,
  imageUrl: channelInfo.detail.channelImageUrl
})