import { Column, Entity, PrimaryColumn } from "typeorm";
import { DeviceDto } from './dto/device.dto'

@Entity('devices')
export class DeviceEntity {
  @PrimaryColumn({ name: 'device_id' })
  deviceId: string

  @Column({ name: 'secret_key'})
  secretKey: string

  toDto(): DeviceDto {
    return {
      deviceId: this.deviceId,
      secretKey: this.secretKey,
    }
  }
}