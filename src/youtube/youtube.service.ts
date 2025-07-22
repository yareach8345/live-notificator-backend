import { PlatformBaseService } from '../commons/base/platform-base.service'
import { youtube, youtube_v3 } from '@googleapis/youtube'
import Youtube = youtube_v3.Youtube
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { YouTubeChannelParsingException } from '../commons/exceptions/youtube-channel-parsing.exception'
import { getChannelImageUrl, requiredField, stringFieldToNumber } from './youtube.util'
import {
  FetchedChannelDetailDto,
  FetchedChannelInfoDto,
  FetchedLiveStateDto, LiveCloseDto, LiveOpenDto,
} from '../commons/dto/fetched-channel-info.dto'
import Schema$Channel = youtube_v3.Schema$Channel
import { groupBy } from 'lodash'
import Schema$Video = youtube_v3.Schema$Video

@Injectable()
export class YoutubeService extends PlatformBaseService {
  protected readonly logger = new Logger(YoutubeService.name)
  private readonly youtubeClient: Youtube

  constructor() {
    super()

    this.youtubeClient = youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    })
  }

  async fetchChannel(channelIds: string[]) {
    if(channelIds.length === 0) {
      return []
    }

    const response = await this.youtubeClient.channels.list({
      id: channelIds,
      part: ['snippet', 'statistics'],
    })

    if (!response.data || !response.data.items) {
      this.logger.error(`channel 정보를 가져오는대 실패 했습니다.(channelId: ${channelIds}) 요청에 실패 했습니다.`)

      throw new HttpException(
        `channel 정보를 가져오는대 실패 했습니다.(channelId: ${channelIds}) 채널을 불러오는대 실패 했습니다.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return response.data.items
  }

  async fetchLiveId(channelIds: string[]): Promise<IdValuePairDto<string, string | undefined>[]> {
    if(channelIds.length === 0) {
      return []
    }

    const result = channelIds.map(async channelId => {
      const response = await this.youtubeClient.search.list({
        channelId: channelId,
        eventType: 'live',
        type: ['video'],
        part: ['id'],
        maxResults: 1
      })

      if (
        !response.data ||
        !response.data.items
      ) {
        this.logger.error(`라이브의 id를 가져오는대 실패 했습니다.(channelId: ${channelId}) 요청에 실패 했습니다.`)

        throw new HttpException(
          `라이브의 id를 가져오는대 실패 했습니다.(channelId: ${channelId}) 요청에 실패 했습니다.`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      if(
        response.data.items.length === 0 ||
        !response.data.items[0].id ||
        !response.data.items[0].id.videoId
      ) {
        return {
          id: channelId,
          value: undefined
        }
      }

      return {
        id: channelId,
        value: response.data.items[0].id.videoId
      }
    })

    return await Promise.all(result)
  }

  async fetchLive(liveId: string[]): Promise<IdValuePairDto<string, Schema$Video>[]> {
    if(liveId.length === 0) {
      return []
    }

    const response = await this.youtubeClient.videos.list({
      id: liveId,
      part: ['snippet', 'liveStreamingDetails'],
      maxResults: 1,
    })

    if (
      !response.data ||
      !response.data.items ||
      response.data.items.length === 0
    ) {
      this.logger.error(`라이브 정보를 가져오는대 실패 했습니다.(liveId: ${liveId}) 요청에 실패 했습니다.`)

      throw new HttpException(
        `라이브 정보를 가져오는대 실패 했습니다.(liveId: ${liveId}) 요청에 실패 했습니다.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return response.data.items.map(video => ({
      id: requiredField(video.snippet?.channelId),
      value: video,
    }))
  }

  async fetchCategory(categoryId: string[]) {
    if(categoryId.length === 0) {
      return []
    }

    const response = await this.youtubeClient.videoCategories.list({
      id: categoryId,
      part: ['snippet'],
    })

    if (
      !response.data ||
      !response.data.items ||
      response.data.items.length === 0
    ) {
      this.logger.error(`카테고리 정보를 가져오는대 실패 했습니다.(categoryId: ${categoryId}) 요청에 실패 했습니다.`)

      throw new HttpException(
        `카테고리 정보를 가져오는대 실패 했습니다.(categoryId: ${categoryId}) 요청에 실패 했습니다.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return response.data.items.map(category => ({
      id: requiredField(category.id),
      value: requiredField(category.snippet?.title)
    }))
  }

  private channelSchemaToChannelsDetail = (channel: Schema$Channel): IdValuePairDto<string, FetchedChannelDetailDto> => {
    const channelId = requiredField(channel.id, `채널의 channelId를 찾을 수 없습니다`)

    const channelDescription = channel.snippet?.description ?? ''

    const channelImageUrl = getChannelImageUrl(channel)

    const displayName = requiredField(channel.snippet?.title, `채널명 파싱 실패. ${channelId} 채널의 snippet.title 필드 값이 null입니다.`)

    const followerCount = parseInt(requiredField(channel.statistics?.subscriberCount, `구독자 파싱 실패. ${channelId} 채널의 statistics.follower 필드 값이 null입니다.`))

    return {
      id: channelId,
      value: {
        displayName,
        channelImageUrl,
        channelDescription,
        followerCount
      }
    }
  }

  async getChannelDetail(channelId: string[]): Promise<IdValuePairDto<string, FetchedChannelDetailDto>[]> {
    const channels =  await this.fetchChannel(channelId)

    return channels.map(this.channelSchemaToChannelsDetail)
  }

  async getLiveState(channelIds: string[]): Promise<IdValuePairDto<string, FetchedLiveStateDto>[]> {
    const liveIds = await this.fetchLiveId(channelIds)

    const { true: openLiveIds = [], false: closeLiveIds = [] } = groupBy(liveIds, live => live.value !== undefined)

    const closedLiveResults: IdValuePairDto<string, LiveCloseDto>[] = closeLiveIds.map(liveId => ({
      id: liveId.id,
      value: {
        isOpen: false,
        state: 'closed'
      }
    }))

    const livesInfos = await this.fetchLive(openLiveIds.map(liveId => liveId.value).filter(id => id !== undefined))
    const categoryIds = livesInfos.map(liveInfo => liveInfo.value.snippet?.categoryId).filter(id => id !== undefined && id !== null)

    const categories = new Map(
      await this.fetchCategory(categoryIds)
        .then(result =>
          result.map(({id, value}) => [id, value]))
    )

    const liveInfos = await this.fetchLive(liveIds.map(liveInfo => liveInfo.value).filter(id => id !== undefined))

    const openLiveResult: IdValuePairDto<string, LiveOpenDto>[] = liveInfos.map(({id: channelId, value: liveInfo}) => {
      const liveTitle = requiredField(liveInfo.snippet?.title)

      const tags = liveInfo.snippet?.tags ?? []

      const concurrentUserCount = requiredField(stringFieldToNumber(liveInfo.liveStreamingDetails?.concurrentViewers))

      const categoryId = requiredField(liveInfo.snippet?.categoryId)

      const category = requiredField(categories.get(categoryId))

      const liveId = requiredField(liveInfo.id)

      return {
        id: channelId,
        value: {
          isOpen: true,
          state: 'open',
          liveTitle,
          tags,
          concurrentUserCount,
          category,
          liveId,
        }
      }
    })

    return [
      ...closedLiveResults,
      ...openLiveResult
    ]
  }

  protected async loadChannelInfo(channelId: string): Promise<FetchedChannelInfoDto> {
    const [detail, liveState] = await Promise.all([
      this.getChannelDetail([channelId]),
      this.getLiveState([channelId]),
    ])

    return {
      channelId: { platform: 'youtube', id: channelId },
      detail: detail[0].value,
      liveState: liveState[0].value
    }
  }

  async getChannelInfos(channelIds: string[]): Promise<FetchedChannelInfoDto[]> {
    if(channelIds.length === 0) {
      return []
    }

    const [detail, liveState] = await Promise.all([
      this.getChannelDetail(channelIds),
      this.getLiveState(channelIds),
    ])

    const detailMap = new Map(detail.map(({id, value})=> [id, value]))
    const liveStateMap = new Map(liveState.map(({id, value})=> [id, value]))

    return channelIds.map(id => ({
      channelId: { platform: 'youtube', id: id },
      detail: detailMap.get(id)!!,
      liveState: liveStateMap.get(id)!!
    }))
  }
}