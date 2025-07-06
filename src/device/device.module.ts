import { Module } from '@nestjs/common'
import { ChannelModule } from '../channel/channel.module'
import { DeviceChannelController } from './device-channel.controller'
import { DeviceService } from './device.service'
import { MessageDispatcherModule } from '../message-dispatcher/message-dispatcher.module'

@Module({
  imports: [
    ChannelModule,
    MessageDispatcherModule,
  ],
  providers: [DeviceService],
  controllers: [DeviceChannelController]
})
export class DeviceModule {}