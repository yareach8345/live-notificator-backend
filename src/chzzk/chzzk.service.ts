import { Injectable, Logger } from '@nestjs/common'
import { ChzzkClient } from 'chzzk'
import { ChzzkChannelDetailDto } from './dto/chzzk-channel-detail.dto'
import { getLiveStateDtoFromLiveStatus } from './chzzk.util'
import { ChzzkChannelInfoDto } from './dto/chzzk-channel-info.dto'
import { ChzzkLiveStateDto } from './dto/chzzk-live-state.dto'
import { RuntimeException } from '@nestjs/core/errors/exceptions'
import { PlatformBaseService } from '../commons/base/platform-base.service'

@Injectable()
export class ChzzkService extends PlatformBaseService<ChzzkChannelDetailDto> {
  private readonly chzzkClient: ChzzkClient
  protected readonly logger: Logger

  constructor() {
    const logger = new Logger(ChzzkService.name)

    super(logger)
    this.logger = logger

    this.chzzkClient = new ChzzkClient({
      nidAuth: process.env.NID_AUT,
      nidSession: process.env.NID_SES,
    })
  }

  async getChannelInfo(channelId: string): Promise<ChzzkChannelInfoDto> {
    const channel = await this.chzzkClient.channel(channelId)

    if(channel === null) {
      this.logger.error(`채널에 대한 정보를 찾을 수 없습니다. 채널 ID를 확인 해주세요. : ${channelId}`)
      throw new RuntimeException(`채널에 대한 정보를 찾을 수 없습니다. 채널 ID를 확인 해주세요. : ${channelId}`)
    }

    return {
      channelId: channel.channelId,
      channelImageUrl: channel.channelImageUrl,
      displayName: channel.channelName,
      channelDescription: channel.channelDescription,
      followerCount: channel.followerCount
    }
  }

  async getLiveState(channelId: string): Promise<ChzzkLiveStateDto> {
    const live = await this.chzzkClient.live.status(channelId)

    return getLiveStateDtoFromLiveStatus(live)
  }

  protected async loadChannelDetail(channelId: string): Promise<ChzzkChannelDetailDto> {
    const channel = await this.getChannelInfo(channelId)
    const liveState = await this.getLiveState(channelId)

    return { channelId, channel, liveState }
  }
}