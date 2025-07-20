import { Pageable } from "../dto/page.dto";
import { ChannelId } from '../types/channel-id.type'

export const calcPagination = (pageable: Pageable | undefined) => {
  if(pageable !== undefined) {
    const { page = 1, pageSize = 10 } = pageable
    return { skip: (page - 1) * pageSize, take: pageSize }
  } else {
    return undefined
  }
}

export const channelIdToKey = (channelId: ChannelId) => ({
  platform: channelId.platform,
  channelId: channelId.id,
})