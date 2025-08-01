import { Injectable, Logger } from '@nestjs/common'
import { DeviceRepository } from './device.repository'
import { DeviceAuthDto } from './dto/device-auth.dto'
import { RegisterDeviceDto } from './dto/register-device.dto'
import * as uuid from 'uuid'
import { DeviceDto } from './dto/device.dto'
import { AlreadyExistsException } from '../commons/exceptions/already-exists.exception'
import { NotFoundException } from '../commons/exceptions/not-found.exception'
import { UpdateDeviceDto } from './dto/update-device.dto'

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

    const isExists = await this.deviceRepository.existsByDeviceId(deviceId)
    if (isExists) {
      throw new AlreadyExistsException(`'${deviceId}'로 저장된 디바이스가 이미 존재합니다.`)
    }

    const secretKey = uuid.v4()

    const newDeviceDto = {
      ...registerDeviceDto,
      secretKey: secretKey,
      isUsable: true
    }

    await this.deviceRepository.saveDevice(newDeviceDto)

    this.logger.log(`디바이스 등록 : ${deviceId}`)

    return newDeviceDto
  }

  async resetSecretKey(deviceId: string) {
    const device = await this.deviceRepository.getDevice(deviceId)

    if(device === undefined) {
      throw new NotFoundException(`'${deviceId}'로 등록된 디바이스를 찾을 수 없습니다.`)
    }

    const updatedDeviceDto = {
      ...device,
      secretKey: uuid.v4()
    }

    await this.deviceRepository.saveDevice(updatedDeviceDto)

    this.logger.log(`디바이스 SecretKey 변경 : ${deviceId}`)
    return updatedDeviceDto
  }

  async updateDevice(deviceId: string, changedValues: Partial<UpdateDeviceDto>) {
    const device = await this.deviceRepository.getDevice(deviceId)

    if(device === undefined) {
      throw new NotFoundException(`'${deviceId}'로 등록된 디바이스를 찾을 수 없습니다.`)
    }

    if(
      changedValues.deviceId !== undefined &&
      deviceId !== changedValues.deviceId &&
      await this.deviceRepository.existsByDeviceId(changedValues.deviceId)
    ) {
      throw new NotFoundException(`'id를 변경할 수 없습니다. ${deviceId}'로 등록된 디바이스가 이미 존재합니다.`)
    }

    device.secretKey = uuid.v4()

    if(changedValues.deviceId !== undefined && changedValues.deviceId !== deviceId) {
      await this.deviceRepository.deleteDevice(deviceId)
    }

    const newDevice: DeviceDto = {
      ...device,
      ...changedValues
    }

    await this.deviceRepository.saveDevice(newDevice)

    this.logger.log(`디바이스 정보 업데이트 : ${deviceId}`)

    return newDevice
  }

  async setUsable(deviceId: string, newUsable: boolean) {
    const device = await this.deviceRepository.getDevice(deviceId)

    if(device === undefined) {
      throw new NotFoundException(`'${deviceId}'로 등록된 디바이스를 찾을 수 없습니다.`)
    }

    const newDeviceDto: DeviceDto = {
      ...device,
      isUsable: newUsable
    }

    await this.deviceRepository.saveDevice(newDeviceDto)

    this.logger.log(`${deviceId} 디바이스의 usable 필드 업데이트: ${device.isUsable} -> ${newUsable}`)

    return newDeviceDto
  }

  async deleteDevice(deviceId: string) {
    await this.deviceRepository.deleteDevice(deviceId)
    this.logger.log(`디바이스 삭제 : ${deviceId}`)
  }

  async checkAuth(deviceAuthDto: DeviceAuthDto) {
    const device = await this.deviceRepository.getDevice(deviceAuthDto.deviceId)

    if(device === undefined) {
      return false
    }

    //사용할 수 있는 디바이스이며, 시크릿 키가 일치할 때
    return device.isUsable && device.secretKey === deviceAuthDto.secretKey
  }
}