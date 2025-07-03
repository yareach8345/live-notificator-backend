import { Logger } from '@nestjs/common'

export abstract class PlatformBaseService<CDto> {
  constructor(protected readonly logger?: Logger) {}

  protected abstract loadChannelInfo(channelId: string): Promise<CDto>

  async getChannelInfo(channelId: string): Promise<CDto> {
    this.logger?.log(`채널 정보를 불러옵니다: ${channelId}`)
    const channelInfo = await this.loadChannelInfo(channelId)
    this.logger?.log(`채널 정보를 불러왔습니다: ${channelId}`)
    return channelInfo
  }

  async getChannelInfos(channelIds: string[]): Promise<CDto[]> {
    this.logger?.log("채널 정보를 불러옵니다")
    const channelInfo = await Promise.all(channelIds.map(channelId => this.loadChannelInfo(channelId)))
    this.logger?.log(`${channelInfo.length}개의 채널 정보를 불러왔습니다.`)
    return channelInfo;
  }
}