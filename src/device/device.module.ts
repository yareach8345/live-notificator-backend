import { Module } from '@nestjs/common'
import { ChannelModule } from '../channel/channel.module'
import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'

@Module({
  imports: [ChannelModule],
  providers: [DeviceService],
  controllers: [DeviceController]
})
export class DeviceModule {}