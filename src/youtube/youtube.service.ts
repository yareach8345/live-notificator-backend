import { PlatformBaseService } from '../commons/base/platform-base.service'
import { YoutubeChannelInfoDto } from './dto/youtube-channel-info.dto'
import { youtube, youtube_v3 } from '@googleapis/youtube'
import Youtube = youtube_v3.Youtube
import { YoutubeChannelDetailDto } from './dto/youtube-channel-detail.dto'
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { YouTubeChannelParsingException } from '../commons/exceptions/youtube-channel-parsing.exception'
import { getChannelImageUrl, stringFieldToNumber } from './youtube.util'
import { YoutubeLiveStateDto } from './dto/youtube-live-state.dto'

@Injectable()
export class YoutubeService extends PlatformBaseService<YoutubeChannelInfoDto> {
  protected readonly logger = new Logger(YoutubeService.name)
  private readonly youtubeClient: Youtube

  constructor() {
    super()

    this.youtubeClient = youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    })
  }

  async fetchChannel(channelId: string) {
    const response = await this.youtubeClient.channels.list({
      id: [channelId],
      part: ['snippet', 'statistics'],
      maxResults: 1,
    })

    if (!response.data || !response.data.items) {
      this.logger.error(`channel 정보를 가져오는대 실패 했습니다.(channelId: ${channelId}) 요청에 실패 했습니다.`)

      throw new HttpException(
        `channel 정보를 가져오는대 실패 했습니다.(channelId: ${channelId}) 채널을 불러오는대 실패 했습니다.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    if(response.data.items.length === 0) {
      this.logger.error(`channel 정보를 가져오는대 실패 했습니다.(channelId: ${channelId}) 해당 channelId의 채널이 존재하지 않습니다.`)

      throw new HttpException(
        `channel 정보를 가져오는대 실패 했습니다.(channelId: ${channelId}) 해당 channelId의 채널이 존재하지 않습니다.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return response.data.items[0]
  }

  async fetchLiveId(channelId: string) {
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
      return undefined
    }

    return response.data.items[0].id.videoId
  }

  async fetchLive(liveId: string) {
    const response = await this.youtubeClient.videos.list({
      id: [liveId],
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

    if(response.data.items.length === 0) {
      this.logger.error(`라이브 정보를 가져오는대 실패 했습니다.(liveId: ${liveId}) 해당 liveId의 비디오가 존재하지 않습니다.`)

      throw new HttpException(
        `channel 정보를 가져오는대 실패 했습니다.(liveId: ${liveId}) 해당 liveId의 비디오가 채널이 존재하지 않습니다.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return response.data.items[0]
  }

  async fetchCategory(categoryId: string) {
    const response = await this.youtubeClient.videoCategories.list({
      id: [categoryId],
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

    if(response.data.items.length === 0 || !response.data.items[0].snippet || !response.data.items[0].snippet.title) {
      this.logger.error(`카테고리 정보를 가져오는대 실패 했습니다.(categoryId: ${categoryId}) 해당 categoryId의 카테고리가 존재하지 않습니다.`)

      throw new HttpException(
        `카테고리 정보를 가져오는대 실패 했습니다.(categoryId: ${categoryId}) 해당 categoryId의 카테고리가 존재하지 않습니다.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return response.data.items[0].snippet.title
  }

  async getChannelDetail(channelId: string): Promise<YoutubeChannelDetailDto> {
    const channelInfo =  await this.fetchChannel(channelId)

    const channelDescription = channelInfo.snippet?.description ?? ''

    const channelImageUrl = getChannelImageUrl(channelInfo)

    const displayName = channelInfo.snippet?.title
    if(!displayName) {
      throw new YouTubeChannelParsingException(`채널명 파싱 실패. ${channelId} 채널의 snippet.title 필드 값이 null입니다.`)
    }

    const followerCountString = channelInfo.statistics?.subscriberCount
    const followerCount = !!followerCountString ? parseInt(followerCountString) : undefined
    if(!followerCount) {
      throw new YouTubeChannelParsingException(`구독자 파싱 실패. ${channelId} 채널의 statistics.follower 필드 값이 null입니다.`)
    }


    return {
      displayName,
      channelImageUrl,
      channelDescription,
      followerCount
    }
  }

  async getLiveState(channelId: string): Promise<YoutubeLiveStateDto> {
    const liveId = await this.fetchLiveId(channelId)

    if(liveId === undefined) {
      return {
        isOpen: false,
        state: 'closed'
      }
    }

    const liveInfo= await this.fetchLive(liveId)

    const liveTitle = liveInfo.snippet?.title
    if(!liveTitle) {
      throw new YouTubeChannelParsingException(`라이브 정보 파싱 실패. ${liveId} 라이브의 snippet.title 필드 값이 null입니다.`)
    }

    const tags = liveInfo.snippet?.tags ?? []

    const concurrentUserCount = stringFieldToNumber(liveInfo.liveStreamingDetails?.concurrentViewers)
    if(!concurrentUserCount) {
      throw new YouTubeChannelParsingException(`라이브 정보 파싱 실패. ${liveId} 라이브의 liveStreamingDetails.concurrentViewers 필드 값이 null입니다.`)
    }

    const categoryId = liveInfo.snippet?.categoryId
    if(!categoryId) {
      throw new YouTubeChannelParsingException(`라이브 정보 파싱 실패. ${liveId} 라이브의 snippet.category 필드 값이 null입니다.`)
    }

    const category = await this.fetchCategory(categoryId)

    return {
      isOpen: true,
      state: 'open',
      liveTitle,
      tags,
      concurrentUserCount,
      category
    }
  }

  protected async loadChannelInfo(channelId: string): Promise<YoutubeChannelInfoDto> {
    const [detail, liveState] = await Promise.all([
      this.getChannelDetail(channelId),
      this.getLiveState(channelId),
    ])

    return {
      channelId,
      detail,
      liveState
    }
  }
}