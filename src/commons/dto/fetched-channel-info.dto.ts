import { ChannelId } from '../types/channel-id.type'

export interface LiveOpenDto {
  state: 'open',
  isOpen: true,
  liveTitle: string,
  concurrentUserCount: number,
  tags: string[],
  category: string,
  liveId?: string
}

export interface LiveCloseDto {
  state: 'closed',
  isOpen: false,
}

export interface LiveNotFoundDto {
  state: 'notFound',
  isOpen: false,
}

export type FetchedLiveStateDto = LiveOpenDto | LiveCloseDto | LiveNotFoundDto

export interface FetchedChannelDetailDto {
  displayName: string,
  channelDescription: string
  channelImageUrl?: string,
  followerCount: number
}


export interface FetchedChannelInfoDto {
  channelId: ChannelId
  detail: FetchedChannelDetailDto,
  liveState: FetchedLiveStateDto,
}