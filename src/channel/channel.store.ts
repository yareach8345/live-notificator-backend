import { ChannelDetailDto } from './dto/channel-detail.dto'
import { filter, from, lastValueFrom, skip, take, toArray, } from 'rxjs'
import { Injectable } from '@nestjs/common'
import { Pageable } from '../commons/dto/page.dto'

type UpdateCallback = (newChannelDetails: ChannelDetailDto[], oldChannelDetails: ChannelDetailDto[]) => any

@Injectable()
export class ChannelStore {
  private channels: ChannelDetailDto[] = []

  private readonly updateCallbacks: UpdateCallback[] = []

  addUpdateCallback(callback: UpdateCallback) {
    this.updateCallbacks.push(callback)
  }

  /*
    우선순위 기준
    1. 방송 상태가 다른 경우 => 켜진 것이 우선
    2. 방송 상태가 같은 경우 => 우선순위 높은 것이 우선
    3. 방송이 둘 다 켜져있고 우선순위가 같은 경우 => 시청자 수가 우선
    4. 방송이 둘 다 꺼져있고 우선순위가 같은 경우 => 팔로워 수가 우선
   */
  private async sortChannels() {
    this.channels = this.channels.toSorted((c1, c2) => {
      if(c1.liveState.isOpen !== c2.liveState.isOpen) {
        // 1. 방송 상태가 다른 경우 켜진 것이 우선
        return c1.liveState.isOpen ? -1 : 1
      }

      const priorityDiff = c1.priority - c2.priority
      if(priorityDiff !== 0) {
        // 2. 방송 상태가 같은 경우 우선순위 높은 것이 우선
        return priorityDiff
      }

      if(c1.liveState.isOpen && c2.liveState.isOpen) {
        // 3. 방송이 둘 다 켜져있고 우선순위가 같으면 시청자수로 비교
        return c2.liveState.concurrentUserCount - c1.liveState.concurrentUserCount
      }

      // 4. 방송이 둘 다 꺼져있고 우선순위가 같으면 팔로워 수 비교
      return c2.channel.followerCount - c1.channel.followerCount
    })
  }

  async update(newData: ChannelDetailDto[]) {
    const oldData = [...this.channels]
    this.channels = newData
    await this.sortChannels()
    this.updateCallbacks.forEach(callback => callback(newData, oldData))
  }

  async updateOne(channelId: string, newData: ChannelDetailDto) {
    const oldChannels = [...this.channels]
    const newChannels = this.channels.map(channel =>
      channel.channel.channelId === channelId ? newData : channel
    )
    this.channels = newChannels
    await this.sortChannels()
    this.updateCallbacks.forEach(callback => callback(newChannels, oldChannels))
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