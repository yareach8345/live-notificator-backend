export interface LiveOpenDto {
  state: 'open',
  isOpen: true,
  liveTitle: string,
  concurrentUserCount: number,
  tags: string[],
  category: string,
}

export interface LiveCloseDto {
  state: 'closed',
  isOpen: false,
}

export interface LiveNotFoundDto {
  state: 'notFound',
  isOpen: false,
}

export type LiveStateDto = LiveOpenDto | LiveCloseDto | LiveNotFoundDto

export interface ChannelDetailDto {
  displayName: string,
  channelDescription: string
  channelImageUrl?: string,
  followerCount: number,
  priority?: number,
  color?: string
}

export interface ChannelInfoDto {
  channelId: string
  platform: string,
  detail: ChannelDetailDto,
  liveState: LiveStateDto,
}