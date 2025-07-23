import { Injectable, Logger } from '@nestjs/common'
import { PlatformBaseService } from '../commons/base/platform-base.service'
import { ChannelInfoDto } from './dto/channel-info.dto'
import { ChzzkService } from '../chzzk/chzzk.service'
import { YoutubeService } from '../youtube/youtube.service'
import { ChannelId } from '../commons/types/channel-id.type'
import { RuntimeException } from '@nestjs/core/errors/exceptions'
import { FetchedChannelInfoDto } from '../commons/dto/fetched-channel-info.dto'
import { groupBy } from 'lodash'

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

    const channelsGroupedByPlatform = Object.entries(groupBy(channelIds, cid => cid.platform))

    const resultsPromises = channelsGroupedByPlatform
      .map(([platform, channelIds]) => [platform, channelIds.map(cid => cid.id)] as const)
      .map(([platformName, channelIds]) => {
        const platform = this.platformServiceMap.get(platformName)
        if(platform === undefined) {
          throw new RuntimeException(`지원하지 않는 플렛폼 ${platformName}`)
        }
        return [platformName, platform.getChannelInfos(channelIds)] as const
      })

    this.logger.log(`플랫폼 별 요청한 채널 수 => [${channelsGroupedByPlatform.map(([p, cids]) =>`${p}: ${cids.length}`).join(', ')}]`)

    const channelsFetchResults = await Promise.all(resultsPromises.map(([_, resultsPromise]) => resultsPromise));
    const channelInfos = channelsFetchResults.flat()
    this.logger.log(`${channelIds.length}개의 채널 정보를 불러왔습니다.`)
    return channelInfos
  }
}