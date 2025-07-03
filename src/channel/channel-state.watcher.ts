import { ChannelChangeObserver } from './channel-change.notifier'
import { ChannelStateDto } from './dto/channel-state.dto'
import { ChannelService } from './channel.service'
import { Injectable } from '@nestjs/common'
import { ChannelInfoMapper } from './channel-info.mapper'

@Injectable()
export class ChannelStateWatcher {
  private readonly stateChannelChangeObserver: ChannelChangeObserver<ChannelStateDto>

  constructor(channelService: ChannelService) {
    this.stateChannelChangeObserver = channelService.channelChangeSubscribe(ChannelInfoMapper.toChannelState)
    this.stateChannelChangeObserver.subscribe(er => {
      console.log('added', er.added)
      console.log('deleted', er.deleted)
      console.log('updated', er.changed)
    })
  }
}