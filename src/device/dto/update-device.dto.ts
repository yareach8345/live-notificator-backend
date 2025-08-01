import { DeviceDto } from './device.dto'

export type UpdateDeviceDto = Omit<DeviceDto, 'secretKey' | 'isUsable'>
