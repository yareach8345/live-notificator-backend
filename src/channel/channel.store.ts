import { ChannelInfoDto } from './dto/channel-info.dto'
import { Injectable } from '@nestjs/common'
import { Pageable } from '../commons/dto/page.dto'
import { ChannelId } from '../commons/types/channel-id.type'
import { isEqual } from 'lodash'
import { sortChannels } from './channel.util'

@Injectable()
export class ChannelStore {
  private channels: ChannelInfoDto[] = []

  init = async (newData: ChannelInfoDto[]) => {
    this.channels = sortChannels(newData)
    return this.channels.length
  }

  update = (newData: ChannelInfoDto[]) => {
    this.channels = sortChannels(newData)
  }

  updateOne = (channelId: ChannelId, updatedChannel: ChannelInfoDto) => {
    const newChannelInfo = this.channels.map(channel =>
      isEqual(channel.channelId, channelId) ? updatedChannel : channel
    )
    this.channels = sortChannels(newChannelInfo)
  }

  addChannel = (newChannel: ChannelInfoDto) => {
    const isAlreadyExists = this.channels.find(channel => isEqual(channel.channelId, newChannel.channelId)) !== undefined
    if(!isAlreadyExists) {
      this.channels = sortChannels([...this.channels, newChannel])
      return true
    }
    return false
  }

  deleteChannel = (channelId: ChannelId) => {
    const isAlreadyExists = this.channels.find(channel => isEqual(channel.channelId, channelId)) !== undefined
    if(isAlreadyExists) {
      this.channels = this.channels.filter(channel => !isEqual(channel.channelId, channelId))
      return true
    }
    return false
  }

  paging = (channels: ChannelInfoDto[], pageable: Pageable) => {
    const { page, pageSize = 10 } = pageable
    return channels.slice(
      (page - 1) * pageSize,
      page * pageSize
    )
  }

  getChannels(pageable?: Pageable) {
    if( pageable ) {
      return this.paging(this.channels, pageable)
    } else {
      return [...this.channels]
    }
  }

  getChannelById(id: ChannelId) {
    return this.channels.find(channel => isEqual(channel.channelId, id))
  }

  getOpenChannel(pageable?: Pageable) {
    const filteredChannels = this.channels.filter(channel => channel.liveState.isOpen)
    if( pageable ) {
      return this.paging(filteredChannels, pageable)
    } else {
      return filteredChannels
    }
  }

  getCloseChannel(pageable?: Pageable) {
    const filteredChannels = this.channels.filter(channel => !channel.liveState.isOpen)
    if( pageable ) {
      return this.paging(filteredChannels, pageable)
    } else {
      return filteredChannels
    }
  }
}