import { Module } from '@nestjs/common'
import { ChannelImageNotifier } from './channel-image.notifier'
import { ChannelInfoNotifier } from './channel-info.notifier'
import { ChannelStateNotifier } from './channel-state.notifier'
import { MessageDispatcherModule } from '../message-dispatcher/message-dispatcher.module'
import { MessageDispatcherService } from '../message-dispatcher/message-dispatcher.service'
import { SseModule } from '../sse/sse.module'
import { MqttModule } from '../mqtt/mqtt.module'

@Module({
  imports: [
    MessageDispatcherModule,
    SseModule,
    MqttModule
  ],
  exports: [
    ChannelStateNotifier,
    ChannelInfoNotifier,
    ChannelImageNotifier
  ],
  providers: [
    MessageDispatcherService,
    ChannelStateNotifier,
    ChannelInfoNotifier,
    ChannelImageNotifier
  ]
})
export class NotifierModule {}