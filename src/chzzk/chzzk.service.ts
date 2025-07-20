import { Injectable, Logger } from '@nestjs/common'
import { ChzzkClient } from 'chzzk'
import { FetchedChannelDetailDto, FetchedChannelInfoDto, FetchedLiveStateDto } from '../commons/dto/fetched-channel-info.dto'
import { getChannelDetailDtoFromChannelDto, getLiveStateDtoFromLiveStatus } from './chzzk.util'
import { RuntimeException } from '@nestjs/core/errors/exceptions'
import { PlatformBaseService } from '../commons/base/platform-base.service'

@Injectable()
export class ChzzkService extends PlatformBaseService {
  private readonly chzzkClient: ChzzkClient
  protected readonly logger: Logger = new Logger(ChzzkService.name)

  constructor() {
    super()

    this.chzzkClient = new ChzzkClient({
      nidAuth: process.env.NID_AUT,
      nidSession: process.env.NID_SES,
    })
  }

  async getChannelDetail(channelId: string): Promise<FetchedChannelDetailDto> {
    const channel = await this.chzzkClient.channel(channelId)

    if(channel === null) {
      this.logger.error(`채널에 대한 정보를 찾을 수 없습니다. 채널 ID를 확인 해주세요. : ${channelId}`)
      throw new RuntimeException(`채널에 대한 정보를 찾을 수 없습니다. 채널 ID를 확인 해주세요. : ${channelId}`)
    }

    return getChannelDetailDtoFromChannelDto(channel)
  }

  async getLiveState(channelId: string): Promise<FetchedLiveStateDto> {
    const live = await this.chzzkClient.live.status(channelId)

    return getLiveStateDtoFromLiveStatus(live)
  }

  protected async loadChannelInfo(channelId: string): Promise<FetchedChannelInfoDto> {
    const detail = await this.getChannelDetail(channelId)
    const liveState = await this.getLiveState(channelId)

    return {
      channelId: { platform: 'chzzk', id: channelId },
      detail,
      liveState
    }
  }
}