import { Injectable } from '@nestjs/common'
import { MessageDispatcherService } from '../message-dispatcher/message-dispatcher.service'
import { ChannelId } from '../commons/types/channel-id.type'

@Injectable()
export class ChannelImageNotifier {
  constructor(
    private readonly messageDispatcherService: MessageDispatcherService,
  ) {}

  notify = async (
    channelId: ChannelId,
  ) => {
    this.messageDispatcherService.notifyChannelImageChanged(channelId)
  }
}