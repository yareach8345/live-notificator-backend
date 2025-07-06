import { Module } from '@nestjs/common'
import { MessageDispatcherService } from './message-dispatcher.service'
import { MqttModule } from '../mqtt/mqtt.module'

@Module({
  imports: [MqttModule],
  providers: [MessageDispatcherService],
  exports: [MessageDispatcherService],
})
export class MessageDispatcherModule {}