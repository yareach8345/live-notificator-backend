export interface ChannelInfoForDeviceDto {
  displayName: string,
  color: string,
  priority: number,
  followerCount: number,
}

export interface ChannelOpenStateForDeviceDto {
  isOpen: true
  category: string,
  liveTitle: string,
  concurrentUserCount: number
}

export interface ChannelCloseStateForDeviceDto {
  isOpen: false
}

export type ChannelStateForDeviceDto = ChannelOpenStateForDeviceDto | ChannelCloseStateForDeviceDto

export interface ChannelDetailForDeviceDto {
  channelId: string,
  channel: ChannelInfoForDeviceDto
  state: ChannelStateForDeviceDto
}