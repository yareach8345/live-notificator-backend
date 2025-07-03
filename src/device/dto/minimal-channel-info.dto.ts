export interface LiveOpenDto {
  isOpen: true
  liveTitle: string
  concurrentUserCount: number
  category: string
}

export interface LiveCloseDto {
  isOpen: false
}

export type MinimalLiveStateDto = LiveOpenDto | LiveCloseDto

export interface MinimalChannelDetail {
  displayName: string
  followerCount: number
  priority: number
  color?: string
}

export interface MinimalChannelInfoDto {
  channelId: string
  detail: MinimalChannelDetail
  liveState: MinimalLiveStateDto
}