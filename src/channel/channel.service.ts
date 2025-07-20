import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ChannelRepository } from './channel.repository';
import { Pageable } from 'src/commons/dto/page.dto';
import { ChzzkService } from '../chzzk/chzzk.service'
import { RegisterChannelDto } from './dto/register-channel.dto'
import { ChannelDto } from './dto/channel.dto';
import { ChannelInfoUpdateCallback, ChannelStore } from './channel.store'
import { Cron } from '@nestjs/schedule'
import { ChannelInfoMapper } from './channel-info.mapper'
import { MessageDispatcherService } from '../message-dispatcher/message-dispatcher.service'
import {
  ChannelChangeObserver,
  ChannelInfoTransformer,
  createChannelChangeNotifier,
} from './channel-change.notifier'
import { EditChannelDto } from './dto/edit-channel.dto';
import { RuntimeException } from '@nestjs/core/errors/exceptions'
import { ChannelId } from '../commons/types/channel-id.type'

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly chzzkService: ChzzkService,
    private readonly channelStore: ChannelStore,
    messageDispatcher: MessageDispatcherService,
  ) {
    this.initStore().then(async () => {
      this.logger.log("채널 상태 초기화 완료")
    })
    channelStore.addUpdateCallback(() => {
      messageDispatcher.notifyChannelInfoUpdate({
        date: new Date(),
      })
    })
  }

  private getChannelDataFromChzzk = async () => {
    const channels = await this.channelRepository.getChannels()

    const priorityMap = new Map(channels.map(channel => [channel.channelId.id, channel]))
    const chzzkChannelInfos = await this.chzzkService.getChannelInfos(
      channels.map(channel => channel.channelId.id)
    )

    return chzzkChannelInfos.map(ch =>
      ChannelInfoMapper.fromChzzk(
        ch,
        priorityMap.get(ch.channelId)!
      )
    )
  }

  private async initStore() {
    const channelInfo = await this.getChannelDataFromChzzk()

    const numberOfAddedChannel = await this.channelStore.init(channelInfo)
    this.logger.log(`${numberOfAddedChannel}개의 채널 정보를 저장했습니다.`)
  }

  private async updateStore() {
    const channelInfo = await this.getChannelDataFromChzzk()

    const numberOfChangedChannel = await this.channelStore.update(channelInfo)
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

  async getChannel(channelId: ChannelId) {
    const channel = this.channelStore.getChannelById(channelId)

    if(channel === undefined) {
      throw new NotFoundException(`채널을 찾을 수 없습니다: ${channelId.platform}-${channelId.id}`)
    }

    return channel
  }

  async getChannelsByPlatform(platform: string) {
    return this.channelRepository.getChannelsByPlatform(platform)
  }

  async registerChannel(channelRegistrationDto: RegisterChannelDto) {
    const chzzkChannelInfo = await this.chzzkService.getChannelInfo(channelRegistrationDto.channelId.id)

    const channelInfo = ChannelInfoMapper.fromChzzk(chzzkChannelInfo, channelRegistrationDto)

    const channelDto: ChannelDto = {
      ...channelRegistrationDto,
      color: channelRegistrationDto.color?.toLowerCase(),
      displayName: channelInfo.detail.displayName,
    }

    await this.channelRepository.saveChannel(channelDto)
    this.logger.log(`채널을 등록 했습니다: ${channelDto.displayName}(${channelDto.channelId.platform}/${channelDto.channelId.id})`)

    await this.channelStore.addChannel(channelInfo)

    return channelDto
  }

  async unregisterChannel(channelId: ChannelId) {
    await this.channelRepository.deleteChannel(channelId)

    await this.channelStore.deleteChannel(channelId)
    this.logger.log(`채널을 삭제 했습니다: ${channelId}`)
  }

  async updateChannel(channelId: ChannelId, editChannelDto: EditChannelDto) {
    const afterUpdate = await this.channelRepository.updateChannel(
      channelId,
      {
        color: editChannelDto.color?.toLowerCase(),
        priority: editChannelDto.priority
      }
    )

    if(afterUpdate === null) {
      throw new RuntimeException("알 수 없는 에러 발생. 채널을 업데이트한 이후의 결과가 null입니다.")
    }

    const currentChannel = this.channelStore.getChannelById(channelId)
    if(currentChannel === undefined) {
      throw new RuntimeException("알 수 없는 에러 발생. 업데이트한 채널을 스토어에서 불러올 수 없습니다.")
    }

    const channelInfoAfterUpdate = {
      ...currentChannel,
      detail: {
        ...currentChannel.detail,
        color: editChannelDto.color,
        priority: editChannelDto.priority
      }
    }

    await this.channelStore.updateOne(channelId, channelInfoAfterUpdate)

    return afterUpdate
  }

  channelChangeSubscribe<R extends Record<'channelId', ChannelId>>(transformFromChannelInfo: ChannelInfoTransformer<R>): ChannelChangeObserver<R> {
    const [emitter, observer] = createChannelChangeNotifier<R>(transformFromChannelInfo)
    this.channelStore.addUpdateCallback(emitter.emit)
    return observer
  }

  channelInfoUpdateSubscribe(callback: ChannelInfoUpdateCallback) {
    this.channelStore.addUpdateCallback(callback)
  }

  @Cron("0 * * * * *")
  async refreshChannels() {
    this.logger.log("refresh 시작")
    await this.updateStore()
    this.logger.log("refresh 완료")
  }
}