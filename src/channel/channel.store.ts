import { ChannelDetailDto } from '../chzzk/dto/channel-detail.dto'
import { filter, from, lastValueFrom, skip, take, toArray, } from 'rxjs'
import { Injectable } from '@nestjs/common'
import { Pageable } from '../commons/types/database'
import { ChannelRepository } from './channel.repository'

@Injectable()
export class ChannelStore {
  private channels: ChannelDetailDto[] = []

  constructor(
    private readonly channelRepository: ChannelRepository
  ) {}

  private async sortChannels() {
    const priorityMap = await this.channelRepository.getPriorityMap()
    this.channels = this.channels.toSorted((c1, c2) => {
      if(c1.liveState.isOpen !== c2.liveState.isOpen) {
        return c1.liveState.isOpen ? -1 : 1
      } else {
        return priorityMap.get(c1.channelId)! - priorityMap.get(c2.channelId)!
      }
    })
  }

  async update(newData: ChannelDetailDto[]) {
    this.channels = newData
    await this.sortChannels()
  }

  async updateOne(channelId: string, newData: ChannelDetailDto) {
    this.channels = this.channels.map(channel =>
      channel.channel.channelId === channelId ? newData : channel
    )
    await this.sortChannels()
  }

  async addChannel(channel: ChannelDetailDto) {
    this.channels.push(channel)
    await this.sortChannels()
  }

  deleteChannel(channelId: string) {
    this.channels = this.channels.filter(channel => channel.channelId !== channelId)
  }

  async getChannels(pageable?: Pageable) {
    if( pageable ) {
      const { page, pageSize = 10 } = pageable
      return lastValueFrom(from(this.channels).pipe(
        skip((page - 1) * pageSize),
        take(pageSize),
        toArray()
      ))
    } else {
      return this.channels
    }
  }

  getChannel(id: string) {
    return this.channels.find(channel => channel.channel.channelId === id)
  }

  getChannelByState(isOpen: boolean, pageable?: Pageable) {
    let filtered$ = from(this.channels).pipe(
      filter(channel => channel.liveState.isOpen === isOpen),
    )

    if(pageable) {
      const { page, pageSize = 10 } = pageable

      filtered$ = filtered$.pipe(
        skip((page - 1) * pageSize),
        take(pageSize)
      )
    }

    return filtered$.pipe(
      toArray()
    )
  }

  async getOpenChannel(pageable?: Pageable) {
    return lastValueFrom(this.getChannelByState(true, pageable))
  }

  async getCloseChannel(pageable?: Pageable) {
    return lastValueFrom(this.getChannelByState(false, pageable))
  }
}