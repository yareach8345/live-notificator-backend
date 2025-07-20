import { FetchedChannelInfoDto } from '../dto/fetched-channel-info.dto'

export abstract class PlatformBaseService<ID = string> {
  protected abstract loadChannelInfo(channelId: ID): Promise<FetchedChannelInfoDto>

  async getChannelInfo(channelId: ID): Promise<FetchedChannelInfoDto> {
    return await this.loadChannelInfo(channelId)
  }

  async getChannelInfos(channelIds: ID[]): Promise<FetchedChannelInfoDto[]> {
    return await Promise.all(channelIds.map(channelId => this.loadChannelInfo(channelId)));
  }
}