import { ChannelInfoDto } from './dto/channel-info.dto'
import { filter, from, lastValueFrom, skip, take, toArray } from 'rxjs'
import { Injectable, Logger } from '@nestjs/common'
import { Pageable } from '../commons/dto/page.dto'
import { generateDiffEvaluator } from '../commons/utils/evaluation.util'
import { ChannelId } from '../commons/types/channel-id.type'
import { isEqual } from 'lodash'

export type ChannelInfoUpdateCallback = (newChannelInfos: ChannelInfoDto[], oldChannelInfos: ChannelInfoDto[]) => any

@Injectable()
export class ChannelStore {
  private channels: ChannelInfoDto[] = []

  private logger: Logger = new Logger(ChannelStore.name)

  private readonly updateCallbacks: ChannelInfoUpdateCallback[] = []

  private readonly evaluate = generateDiffEvaluator<ChannelInfoDto>()

  addUpdateCallback(callback: ChannelInfoUpdateCallback) {
    this.updateCallbacks.push(callback)
  }

  private withUpdateCallback = async <T>(run: (oldData: ChannelInfoDto[]) => Promise<T>) => {
    const oldChannels = [...this.channels]
    const result = await run(oldChannels)
    const newChannels = [...this.channels]
    this.updateCallbacks.forEach(callback => callback(newChannels, oldChannels))
    return result
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

      const priorityDiff = (c1.detail.priority ?? 256) - (c2.detail.priority ?? 256)
      if(priorityDiff !== 0) {
        // 2. 방송 상태가 같은 경우 우선순위 높은 것이 우선
        return priorityDiff
      }

      if(c1.liveState.isOpen && c2.liveState.isOpen) {
        // 3. 방송이 둘 다 켜져있고 우선순위가 같으면 시청자수로 비교
        return c2.liveState.concurrentUserCount - c1.liveState.concurrentUserCount
      }

      // 4. 방송이 둘 다 꺼져있고 우선순위가 같으면 팔로워 수 비교
      return c2.detail.followerCount - c1.detail.followerCount
    })
  }

  init = async (newData: ChannelInfoDto[]) => {
    this.logger.log(`데이터 초기화. ${newData.length}개의 데이터를 추가합니다.`)
    this.channels = newData
    await this.sortChannels()
    return this.channels.length
  }

  update = (newData: ChannelInfoDto[]) =>
    this.withUpdateCallback(async (oldData) => {
      const evaluateResult = this.evaluate(oldData, newData)
      const numberOfUpdatedChannels = newData.length - evaluateResult.unchanged.length
      this.logger.log(`데이터 업데이트 ${numberOfUpdatedChannels}/${newData.length} (changed: ${evaluateResult.changed.length}, added: ${evaluateResult.added.length}, deleted: ${evaluateResult.deleted.length}, unchanged: ${evaluateResult.unchanged.length})`)
      this.channels = newData
      await this.sortChannels()
      return numberOfUpdatedChannels
    })

  updateOne = (channelId: ChannelId, newData: ChannelInfoDto) =>
    this.withUpdateCallback(async () => {
      this.channels = this.channels.map(channel =>
        isEqual(channel.channelId, channelId) ? newData : channel
      )
      await this.sortChannels()
    })

  addChannel = (channel: ChannelInfoDto) =>
    this.withUpdateCallback(async () => {
      const isAlreadyExists = this.channels.map(c => c.channelId).find(id => isEqual(id, channel.channelId)) !== undefined
      if(!isAlreadyExists) {
        this.channels.push(channel)
        await this.sortChannels()
      }
    })

  deleteChannel = (channelId: ChannelId) =>
    this.withUpdateCallback(async () => {
      this.channels = this.channels.filter(channel => !isEqual(channel.channelId, channelId))
    })

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

  getChannelById(id: ChannelId) {
    return this.channels.find(channel => isEqual(channel.channelId, id))
  }

  getChannelByState(isOpen: boolean, pageable?: Pageable) {
    let filtered$ = from(this.channels).pipe(
      filter(channel => isEqual(channel.liveState.isOpen, isOpen)),
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