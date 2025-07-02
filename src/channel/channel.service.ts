import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ChannelRepository } from './channel.repository';
import { Pageable } from 'src/commons/dto/page.dto';
import { ChzzkService } from '../chzzk/chzzk.service'
import { RegisterChannelDto } from './dto/register-channel.dto'
import { ChannelDto } from './dto/channel.dto';
import { ChannelStore } from './channel.store'
import { Cron } from '@nestjs/schedule'
import { ChannelDetailMapper } from './channel-detail.mapper'
import {
  ChannelChangeObserver,
  ChannelDetailTransformer,
  createChannelChangeNotifier,
} from './channel-change.notifier'

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly chzzkService: ChzzkService,
    private readonly channelStore: ChannelStore,
  ) {
    this.updateStore().then(async () => {
      this.logger.log("채널 상태 초기화 완료")
    })
  }

  private async updateStore() {
    const channels = await this.channelRepository.getChannels()

    const priorityMap = new Map(channels.map(channel => [channel.channelId, channel.priority]))
    const chzzkChannelDetails = await this.chzzkService.getChannelDetails(
      channels.map(channel => channel.channelId)
    )

    const channelDetails = chzzkChannelDetails.map(ch =>
      ChannelDetailMapper.fromChzzk(
        ch,
        priorityMap.get(ch.channelId) ?? 255
      )
    )

    const numberOfChangedChannel = await this.channelStore.update(channelDetails)
    this.logger.log(`${numberOfChangedChannel}개의 채널 상태를 업데이트 했습니다.`)
  }

  async getChannelIds(pageable?: Pageable) {
    return this.channelRepository.getChannelIds(pageable)
  }

  async getChannels(pageable?: Pageable) {
    return this.channelStore.getChannels(pageable)
  }

  async getOpenChannels(pageable?: Pageable) {
    return this.channelStore.getOpenChannel(pageable)
  }

  async getCloseChannels(pageable?: Pageable) {
    return this.channelStore.getCloseChannel(pageable)
  }

  async getChannel(channelId: string) {
    const channel = this.channelStore.getChannel(channelId)

    if(channel === null) {
      throw new NotFoundException(`채널을 찾을 수 없습니다: ${channelId}`)
    }

    return this.chzzkService.getChannelDetail(channelId)
  }

  async registerChannel(channelRegistrationDto: RegisterChannelDto) {
    const chzzkChannelDetail = await this.chzzkService.getChannelDetail(channelRegistrationDto.channelId)

    const channelDetail = ChannelDetailMapper.fromChzzk(chzzkChannelDetail, channelRegistrationDto.priority ?? 255)

    const channelDto: ChannelDto = {
      ...channelRegistrationDto,
      color: channelRegistrationDto.color?.toLowerCase(),
      displayName: channelDetail.channel.displayName,
    }

    await this.channelRepository.saveChannel(channelDto)
    this.logger.log(`채널을 등록 했습니다: ${channelDto.displayName}(${channelDto.channelId})`)

    await this.channelStore.addChannel(channelDetail)

    return channelDto
  }

  async unregisterChannel(channelId: string) {
    await this.channelRepository.deleteChannel(channelId)
    this.logger.log(`채널을 삭제 했습니다: ${channelId}`)

    await this.channelStore.deleteChannel(channelId)
  }

  channelChangeSubscribe<R extends Record<'channelId', string>>(transformFromDetail: ChannelDetailTransformer<R>): ChannelChangeObserver<R> {
    const [emitter, observer] = createChannelChangeNotifier<R>(transformFromDetail)
    this.channelStore.addUpdateCallback(emitter.emit)
    return observer
  }

  @Cron("0 * * * * *")
  async refreshChannels() {
    this.logger.log("refresh 시작")
    await this.updateStore()
    this.logger.log("refresh 완료")
  }
}