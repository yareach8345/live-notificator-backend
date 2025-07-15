import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeviceEntity } from './device.entity'
import { Repository } from 'typeorm'
import { DeviceDto } from './dto/device.dto'
import * as uuid from 'uuid'
import { RuntimeException } from '@nestjs/core/errors/exceptions'

@Injectable()
export class DeviceRepository {
  private readonly logger = new Logger(DeviceRepository.name)

  constructor(
    @InjectRepository(DeviceEntity)
    private repository: Repository<DeviceEntity>
  ) {}

  getDevices = async () => {
    const deviceEntities = await this.repository.find()
    return deviceEntities.map(deviceEntity => deviceEntity.toDto())
  }

  getDevice = async (deviceId: string) => {
    const deviceEntity = await this.repository.findOneBy({ deviceId: deviceId })
    return deviceEntity?.toDto()
  }

  saveDevice = async (deviceDto: DeviceDto) => {
    if(!uuid.validate(deviceDto.secretKey)) {
      this.logger.error(`${deviceDto.deviceId}의 secretKey가 uuid 형식이 아닙니다 : ${deviceDto.secretKey}`)
      throw new RuntimeException(`${deviceDto.deviceId}의 secretKey가 uuid 형식이 아닙니다 : ${deviceDto.secretKey}`)
    }
    await this.repository.save(deviceDto)
  }
}