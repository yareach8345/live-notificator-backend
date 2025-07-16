import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeviceEntity } from './device.entity'
import { Repository, Transaction } from 'typeorm'
import { DeviceDto } from './dto/device.dto'
import * as uuid from 'uuid'
import { RuntimeException } from '@nestjs/core/errors/exceptions'
import { AlreadyExistsException } from '../commons/exceptions/already-exists.exception'

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

  existsByDeviceId = (deviceId: string) => this.repository.existsBy({ deviceId: deviceId })

  saveDevice = async (deviceDto: DeviceDto) => {
    if(!uuid.validate(deviceDto.secretKey)) {
      this.logger.error(`${deviceDto.deviceId}의 secretKey가 uuid 형식이 아닙니다 : ${deviceDto.secretKey}`)
      throw new RuntimeException(`${deviceDto.deviceId}의 secretKey가 uuid 형식이 아닙니다 : ${deviceDto.secretKey}`)
    }

    await this.repository.save(deviceDto)
  }

  deleteDevice = async (deviceId: string) => {
    const isTheDeviceExists = await this.repository.existsBy({ deviceId: deviceId })
    if(!isTheDeviceExists) {
      throw new NotFoundException(`디바이스를 찾을 수 없습니다 : ${deviceId}`)
    }
    await this.repository.delete(deviceId)
  }
}