import { ChannelDetailDto, ChannelInfoDto, LiveCloseDto, LiveOpenDto, LiveStateDto } from './dto/channel-info.dto'
import { filter, from, lastValueFrom, skip, take, toArray } from 'rxjs'
import { Injectable, Logger } from '@nestjs/common'
import { Pageable } from '../commons/dto/page.dto'
import { generateDiffEvaluator } from '../commons/utils/evaluation.util'
import { ChannelId } from '../commons/types/channel-id.type'
import { isEqual } from 'lodash'
import { sortChannels } from './channel.util'

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



  init = async (newData: ChannelInfoDto[]) =>
    this.withUpdateCallback(async () => {
      this.logger.log(`데이터 초기화. ${newData.length}개의 데이터를 추가합니다.`)
      this.channels = sortChannels(newData)
      return this.channels.length
    })

  update = (newData: ChannelInfoDto[]) =>
    this.withUpdateCallback(async (oldData) => {
      const evaluateResult = this.evaluate(oldData, newData)
      const numberOfUpdatedChannels = newData.length - evaluateResult.unchanged.length
      this.logger.log(`데이터 업데이트 ${numberOfUpdatedChannels}/${newData.length} (changed: ${evaluateResult.changed.length}, added: ${evaluateResult.added.length}, deleted: ${evaluateResult.deleted.length}, unchanged: ${evaluateResult.unchanged.length})`)
      this.channels = sortChannels(newData)
      return numberOfUpdatedChannels
    })

  updateOne = (channelId: ChannelId, newData: ChannelInfoDto) =>
    this.withUpdateCallback(async () => {
      const newData = this.channels.map(channel =>
        isEqual(channel.channelId, channelId) ? newData : channel
      )
      this.channels = sortChannels(newData)
    })

  addChannel = (newChannel: ChannelInfoDto) =>
    this.withUpdateCallback(async () => {
      const isAlreadyExists = this.channels.map(c => c.channelId).find(id => isEqual(id, newChannel.channelId)) !== undefined
      if(!isAlreadyExists) {
        this.channels = sortChannels([...this.channels, newChannel])
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