import { Injectable, Logger } from '@nestjs/common'
import { PlatformBaseService } from '../commons/base/platform-base.service'
import { ChannelInfoDto } from './dto/channel-info.dto'
import { ChzzkService } from '../chzzk/chzzk.service'
import { YoutubeService } from '../youtube/youtube.service'
import { ChannelId } from '../commons/types/channel-id.type'
import { RuntimeException } from '@nestjs/core/errors/exceptions'
import { FetchedChannelInfoDto } from '../commons/dto/fetched-channel-info.dto'

@Injectable()
export class PlatformServiceDispatcher extends PlatformBaseService<ChannelId> {
  private readonly logger = new Logger(PlatformServiceDispatcher.name)

  private readonly platformServiceMap: Map<string, PlatformBaseService> = new Map()

  constructor(
    chzzkService: ChzzkService,
    youtubeService: YoutubeService,
  ) {
    super()

    this.platformServiceMap.set('chzzk', chzzkService)
    this.platformServiceMap.set('youtube', youtubeService)
  }
  
  protected loadChannelInfo(channelId: ChannelId): Promise<ChannelInfoDto> {
    const platformService = this.platformServiceMap.get(channelId.platform)

    if (!platformService) {
      throw new RuntimeException(`Unknown platform: ${channelId.platform}`)
    }

    return platformService.getChannelInfo(channelId.id)
  }

  async getChannelInfo(channelId: ChannelId): Promise<FetchedChannelInfoDto> {
    this.logger.log(`채널 정보를 불러옵니다: ${channelId.platform}-${channelId.id}`)
    const channelInfo = await this.loadChannelInfo(channelId)
    this.logger.log(`채널 정보를 불러왔습니다: ${channelId.platform}-${channelId.id}`)
    return channelInfo
  }

  async getChannelInfos(channelIds: ChannelId[]): Promise<FetchedChannelInfoDto[]> {
    this.logger.log(`${channelIds.length}개의 채널 정보를 불러옵니다.`)
    const channelInfos = await Promise.all(channelIds.map(channelId => this.loadChannelInfo(channelId)));
    this.logger.log(`${channelIds.length}개의 채널 정보를 불러왔습니다.`)
    return channelInfos
  }
}