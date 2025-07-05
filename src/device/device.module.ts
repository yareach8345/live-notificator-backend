import { Module } from '@nestjs/common'
import { ChannelModule } from '../channel/channel.module'
import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'
import { MqttModule } from '../mqtt/mqtt.module'

@Module({
  imports: [
    ChannelModule,
    MqttModule
  ],
  providers: [DeviceService],
  controllers: [DeviceController]
})
export class DeviceModule {}