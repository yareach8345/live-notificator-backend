import { Injectable, Logger } from '@nestjs/common'
import { DeviceRepository } from './device.repository'
import { DeviceAuthDto } from './dto/device-auth.dto'
import { RegisterDeviceDto } from './dto/register-device.dto'
import * as uuid from 'uuid'
import { DeviceDto } from './dto/device.dto'

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name)

  constructor(private readonly deviceRepository: DeviceRepository) {}

  async getDevice(deviceId: string) {
    return await this.deviceRepository.getDevice(deviceId)
  }

  async getDevices() {
    return await this.deviceRepository.getDevices()
  }

  async registerDevice(registerDeviceDto: RegisterDeviceDto): Promise<DeviceDto> {
    const deviceId = registerDeviceDto.deviceId
    const secretKey = uuid.v4()

    await this.deviceRepository.saveDevice({
      deviceId: registerDeviceDto.deviceId,
      secretKey: secretKey,
    })

    return {
      deviceId,
      secretKey,
    }
  }

  async checkAuth(deviceAuthDto: DeviceAuthDto) {
    const device = await this.deviceRepository.getDevice(deviceAuthDto.deviceId)

    if(device === undefined) {
      return false
    }

    return device.secretKey === deviceAuthDto.secretKey
  }
}