import { ChannelDetailDto } from '../chzzk/dto/channel-detail.dto'
import { filter, from, lastValueFrom, skip, take, toArray, } from 'rxjs'
import { Injectable } from '@nestjs/common'
import { Pageable } from '../commons/types/database'

@Injectable()
export class ChannelStore {
  private channels: ChannelDetailDto[] = []

  private sortChannels() {
    this.channels = this.channels.toSorted((c1, c2) =>
      (c1.liveState.isOpen === c2.liveState.isOpen)
      ? 0
      : c1.liveState.isOpen ? -1 : 1
    )
  }

  update(newData: ChannelDetailDto[]) {
    this.channels = newData
    this.sortChannels()
  }

  updateOne(channelId: string, newData: ChannelDetailDto) {
    this.channels = this.channels.map(channel =>
      channel.channel.channelId === channelId ? newData : channel
    )
    this.sortChannels()
  }

  addChannel(channel: ChannelDetailDto) {
    this.channels.push(channel)
    this.sortChannels()
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