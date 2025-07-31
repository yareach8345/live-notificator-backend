import { Column, Entity, PrimaryColumn } from "typeorm";
import { DeviceDto } from './dto/device.dto'

@Entity('devices')
export class DeviceEntity {
  @PrimaryColumn({ name: 'device_id' })
  deviceId: string

  @Column({ name: 'device_name' })
  deviceName: string

  @Column({ name: 'secret_key'})
  secretKey: string

  @Column({ name: 'description', nullable: true, type: 'text' })
  description: string | null

  toDto(): DeviceDto {
    return {
      deviceId: this.deviceId,
      deviceName: this.deviceName,
      secretKey: this.secretKey,
      description: this.description
    }
  }
}