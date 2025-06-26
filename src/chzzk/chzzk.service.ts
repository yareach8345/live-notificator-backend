import { Injectable, Logger } from '@nestjs/common'
import { ChzzkClient } from 'chzzk'
import { ChannelDetailDto } from './dto/channel-detail.dto'
import { getLiveStateDtoFromLiveStatus } from './chzzk.util'
import { ChannelInfoDto } from './dto/channel-info.dto'
import { LiveStateDto } from './dto/live-state.dto'
import { RuntimeException } from '@nestjs/core/errors/exceptions'

@Injectable()
export class ChzzkService {
  private readonly chzzkClient: ChzzkClient
  private readonly logger: Logger = new Logger(ChzzkService.name)

  constructor() {
    this.chzzkClient = new ChzzkClient({
      nidAuth: process.env.NID_AUT,
      nidSession: process.env.NID_SES,
    })
  }

  async getChannelInfo(channelId: string): Promise<ChannelInfoDto> {
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

  async getLiveState(channelId: string): Promise<LiveStateDto> {
    const live = await this.chzzkClient.live.status(channelId)

    return getLiveStateDtoFromLiveStatus(live)
  }

  private async loadChannelDetail(channelId: string): Promise<ChannelDetailDto> {
    const channel = await this.getChannelInfo(channelId)
    const liveState = await this.getLiveState(channelId)

    return { channelId, channel, liveState }
  }

  async getChannelDetail(channelId: string): Promise<ChannelDetailDto> {
    this.logger.log(`채널 정보를 불러옵니다: ${channelId}`)
    const channelDetail = await this.loadChannelDetail(channelId)
    this.logger.log(`채널 정보를 불러왔습니다: ${channelDetail.channel.displayName}(${channelId})`)
    return channelDetail
  }

  async getChannelDetails(channelIds: string[]): Promise<ChannelDetailDto[]> {
    this.logger.log("채널 정보를 다시 불러옵니다")
    const channelDetails = await Promise.all(channelIds.map(channelId => this.loadChannelDetail(channelId)))
    this.logger.log(`${channelDetails.length}개의 채널 정보를 다시 불러왔습니다.`)
    return channelDetails;
  }
}