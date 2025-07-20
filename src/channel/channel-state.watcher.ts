import { ChannelChangeObserver } from './channel-change.notifier'
import { ChannelService } from './channel.service'
import { Injectable, Logger } from '@nestjs/common'
import { ChannelInfoMapper } from './channel-info.mapper'
import { MessageDispatcherService } from '../message-dispatcher/message-dispatcher.service'
import { NotifyChannelStateDto } from '../message-dispatcher/dto/notify-channel-state.dto'
import { ChannelStateDto } from './dto/channel-state.dto'

@Injectable()
export class ChannelStateWatcher {
  private readonly stateChannelChangeObserver: ChannelChangeObserver<ChannelStateDto>
  private readonly logger: Logger = new Logger(ChannelStateWatcher.name)

  constructor(
    private readonly messageDispatcherService: MessageDispatcherService,
    channelService: ChannelService,
  ) {
    this.stateChannelChangeObserver = channelService.channelChangeSubscribe(ChannelInfoMapper.toChannelState)
    this.stateChannelChangeObserver.subscribe(er => {
      this.logger.log('channel state change detected')

      er.changed
        .map(channelState => ({
          channelId: channelState.channelId,
          state: channelState.state,
        }))
        .forEach(this.notifyChannelStateChange)

      er.added
        .map(channelState => ({
          channelId: channelState.channelId,
          state: 'added'
        }))
        .forEach(this.notifyChannelStateChange)

      er.deleted
        .map(channelState => ({
          channelId: channelState.channelId,
          state: 'deleted'
        }))
        .forEach(this.notifyChannelStateChange)
    })
  }

  notifyChannelStateChange = async (channelState: NotifyChannelStateDto) => {
    this.messageDispatcherService.notifyChannelStateChange(channelState)
  }
}