import { Controller, Get, Param, Req, Res, UseGuards } from "@nestjs/common";
import { MinimalChannelService } from './minimal-channel.service'
import { Request, Response } from 'express'
import { getPageable } from '../commons/utils/controller.util'
import { MinimalChannelGuard } from './minimal-channel.guard'

@Controller('channels/minimal')
export class MinimalChannelController {

  constructor( private readonly deviceService: MinimalChannelService) { }

  @Get()
  @UseGuards(MinimalChannelGuard)
  async getChannels(@Req() req: Request, @Res() res: Response) {
    const pageable = getPageable(req.query)

    const channels = await this.deviceService.getChannels(pageable)

    return res.status(200).json(channels);
  }

  @Get(":channelId")
  @UseGuards(MinimalChannelGuard)
  async getChannel(@Res() res: Response, @Param("channelId") channelId: string) {
    const channel = await this.deviceService.getChannel(channelId)

    return res.status(200).json(channel)
  }

  @Get("states/open")
  @UseGuards(MinimalChannelGuard)
  async getOpenChannels(@Res() res: Response) {
    const openChannels = await this.deviceService.getOpenChannels()

    return res.status(200).json(openChannels)
  }

  @Get("states/close")
  @UseGuards(MinimalChannelGuard)
  async getCloseChannels(@Res() res: Response) {
    const closeChannels = await this.deviceService.getCloseChannels()

    return res.status(200).json(closeChannels)
  }
}