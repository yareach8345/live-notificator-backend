import { Module } from '@nestjs/common'
import { MessageDispatcherService } from './message-dispatcher.service'
import { MqttModule } from '../mqtt/mqtt.module'
import { SseModule } from '../sse/sse.module'
import { MqttService } from '../mqtt/mqtt.service'
import { SseService } from '../sse/sse.service'

@Module({
  imports: [
    MqttModule,
    SseModule,
  ],
  providers: [
    MessageDispatcherService,
    MqttService,
    SseService,
  ],
  exports: [MessageDispatcherService],
})
export class MessageDispatcherModule {}