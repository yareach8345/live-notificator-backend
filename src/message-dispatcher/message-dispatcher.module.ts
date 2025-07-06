import { Module } from '@nestjs/common'
import { MessageDispatcherService } from './message-dispatcher.service'
import { MqttModule } from '../mqtt/mqtt.module'
import { SseModule } from '../sse/sse.module'

@Module({
  imports: [
    MqttModule,
    SseModule,
  ],
  providers: [MessageDispatcherService],
  exports: [MessageDispatcherService],
})
export class MessageDispatcherModule {}