import { Logger } from '@nestjs/common'

export abstract class PlatformBaseService<CDto> {
  constructor(protected readonly logger?: Logger) {}

  protected abstract loadChannelDetail(channelId: string): Promise<CDto>

  async getChannelDetail(channelId: string): Promise<CDto> {
    this.logger?.log(`채널 정보를 불러옵니다: ${channelId}`)
    const channelDetail = await this.loadChannelDetail(channelId)
    this.logger?.log(`채널 정보를 불러왔습니다: ${channelId}`)
    return channelDetail
  }

  async getChannelDetails(channelIds: string[]): Promise<CDto[]> {
    this.logger?.log("채널 정보를 다시 불러옵니다")
    const channelDetails = await Promise.all(channelIds.map(channelId => this.loadChannelDetail(channelId)))
    this.logger?.log(`${channelDetails.length}개의 채널 정보를 다시 불러왔습니다.`)
    return channelDetails;
  }
}