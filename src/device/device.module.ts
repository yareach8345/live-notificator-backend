import { Module } from '@nestjs/common'
import { ChannelModule } from '../channel/channel.module'
import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'
import { MessageDispatcherModule } from '../message-dispatcher/message-dispatcher.module'

@Module({
  imports: [
    ChannelModule,
    MessageDispatcherModule,
  ],
  providers: [DeviceService],
  controllers: [DeviceController]
})
export class DeviceModule {}