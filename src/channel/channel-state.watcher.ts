import { ChannelChangeObserver } from './channel-change.notifier'
import { ChannelStateDto } from './dto/channel-state.dto'
import { ChannelService } from './channel.service'
import { Injectable, Logger } from '@nestjs/common'
import { ChannelInfoMapper } from './channel-info.mapper'
import { MessageDispatcherService } from '../message-dispatcher/message-dispatcher.service'
import { SmsService } from '../sms/sms.service'

@Injectable()
export class ChannelStateWatcher {
  private readonly stateChannelChangeObserver: ChannelChangeObserver<ChannelStateDto>
  private readonly logger: Logger = new Logger(ChannelStateWatcher.name)

  constructor(
    private readonly messageDispatcherService: MessageDispatcherService,
    private readonly channelService: ChannelService,
    private readonly smsService: SmsService
  ) {
    this.stateChannelChangeObserver = channelService.channelChangeSubscribe(ChannelInfoMapper.toChannelState)
    this.stateChannelChangeObserver.subscribe(er => {
      this.logger.log('channel state change detected')
      console.log('added', er.added)
      console.log('deleted', er.deleted)
      console.log('changed', er.changed)
      er.changed.forEach(this.notifyChannelStateChange)
    })
  }

  notifyChannelStateChange = async (channelState: ChannelStateDto) => {
    this.messageDispatcherService.notifyChannelStateChange(channelState)

    if(this.smsService.isEnable()) {
      const channelDto = await this.channelService.getChannel(channelState.channelId)
      const channelDisplayName = channelDto.detail.displayName
      await this.smsService.sendChannelStateWithSms({
        state: channelState.state,
        displayName: channelDisplayName,
      })
    }
  }
}