import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ChannelRepository } from './channel.repository';
import { Pageable } from 'src/commons/types/database';
import { ChzzkService } from '../chzzk/chzzk.service'
import { RegisterChannelDto } from './dto/register-channel.dto'
import { ChannelDto } from './dto/channel.dto';
import { ChannelStore } from './channel.store'

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly chzzkService: ChzzkService,
    private readonly channelStore: ChannelStore,
  ) {
    this.updateStore().then(() => {
      this.logger.log("채널 상태 초기화 완료")
    })
  }

  private async updateStore() {
    const ids = await this.channelRepository.getChannelIds()

    this.channelStore.update(await this.chzzkService.getChannelDetails(ids))
    this.logger.log("채널 상태를 업데이트 했습니다.")
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
    const channelDetail = await this.chzzkService.getChannelDetail(channelRegistrationDto.channelId)

    const channelDto: ChannelDto = {
      ...channelRegistrationDto,
      displayName: channelDetail.channel.displayName,
    }

    await this.channelRepository.saveChannel(channelDto)
    this.logger.log(`채널을 등록 했습니다: ${channelDto.displayName}(${channelDto.channelId})`)

    this.channelStore.addChannel(channelDetail)

    return channelDto
  }

  async unregisterChannel(channelId: string) {
    await this.channelRepository.deleteChannel(channelId)
    this.logger.log(`채널을 삭제 했습니다: ${channelId}`)

    this.channelStore.deleteChannel(channelId)
  }
}