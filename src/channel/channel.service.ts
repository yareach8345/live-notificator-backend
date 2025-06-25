import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ChannelRepository } from './channel.repository';
import { Pageable } from 'src/commons/types/database';
import { ChzzkService } from '../chzzk/chzzk.service'
import { RegisterChannelDto } from './dto/register-channel.dto'
import { ChannelDto } from './dto/channel.dto';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly chzzkService: ChzzkService,
  ) {}

  async getChannelIds(pageable?: Pageable) {
    return this.channelRepository.getChannelIds(pageable)
  }

  async getChannels(pageable?: Pageable) {
    const ids = await this.channelRepository.getChannelIds(pageable)

    return this.chzzkService.getChannelDetails(ids)
  }

  async getOpenChannels() {
    const ids = await this.channelRepository.getChannelIds()

    const channels = await this.chzzkService.getChannelDetails(ids)

    return channels.filter(channels => channels.liveState.isOpen)
  }

  async getCloseChannels() {
    const ids = await this.channelRepository.getChannelIds()

    const channels = await this.chzzkService.getChannelDetails(ids)

    return channels.filter(channels => !channels.liveState.isOpen)
  }

  async getChannel(channelId: string) {
    const channel = await this.channelRepository.getChannelById(channelId)

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

    return channelDto
  }

  async unregisterChannel(channelId: string) {
    await this.channelRepository.deleteChannel(channelId)

    this.logger.log(`채널을 삭제 했습니다: ${channelId}`)
  }
}