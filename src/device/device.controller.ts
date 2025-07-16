import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common'
import { DeviceService } from './device.service';
import { Response } from 'express'
import { LoginGuard } from '../auth/guards/login.guard'
import { RegisterDeviceDto } from './dto/register-device.dto'
import { DeviceDto } from './dto/device.dto'

@Controller("/devices")
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @UseGuards(LoginGuard)
  async getDevices(@Res() res: Response) {
    const deviceIds = await this.deviceService.getDevices()
    res.status(200).send(deviceIds)
  }

  @Get(':deviceId')
  @UseGuards(LoginGuard)
  async getDevice(@Res() res: Response, @Param('deviceId') deviceId: string) {
    const deviceIds = await this.deviceService.getDevice(deviceId)
    res.status(200).send(deviceIds)
  }

  @Post()
  @UseGuards(LoginGuard)
  async registerDevice(@Res() res: Response, @Body() registerDeviceDto: RegisterDeviceDto) {
    const newDeviceDto = await this.deviceService.registerDevice(registerDeviceDto)

    res.status(201).location(`devices/${registerDeviceDto.deviceId}`).send(newDeviceDto)
  }

  @Patch(':deviceId')
  @UseGuards(LoginGuard)
  async updateDevice(@Res() res: Response, @Param('deviceId') deviceId: string, @Body() newValues: Partial<DeviceDto>) {
    const updatedDeviceDto = await this.deviceService.updateDevice(deviceId, newValues)

    res.status(201).location(`devices/${newValues.deviceId}`).send(updatedDeviceDto)
  }

  @Patch(':deviceId/reset-secret')
  @UseGuards(LoginGuard)
  async resetSecret(@Res() res: Response, @Param('deviceId') deviceId: string) {
    const updatedDeviceDto = await this.deviceService.resetSecretKey(deviceId)

    res.status(201).send(updatedDeviceDto)
  }

  @Delete(':deviceId')
  @UseGuards(LoginGuard)
  async deleteDevice(@Res() res: Response, @Param('deviceId') deviceId: string) {
    await this.deviceService.deleteDevice(deviceId)

    res.status(201).send(`deleted device ${deviceId}`)
  }
}