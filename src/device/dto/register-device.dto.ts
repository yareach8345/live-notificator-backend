import { DeviceDto } from './device.dto'

export type RegisterDeviceDto = Omit<DeviceDto, 'secretKey' | 'isUsable'>