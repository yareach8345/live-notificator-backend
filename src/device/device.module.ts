import { Module } from "@nestjs/common";
import { DeviceEntity } from './device.entity'
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceRepository } from './device.repository'
import { DeviceService } from './device.service'
import { DeviceController } from './device.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity]),
  ],
  providers: [
    DeviceService,
    DeviceRepository,
  ],
  exports: [ DeviceService ],
  controllers: [DeviceController],
})
export class DeviceModule {}