import { Response, Request } from "express";
import { Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { LoginGuard } from '../auth/auth.guard'
import { ChannelService } from "./channel.service"
import { getPageable } from '../commons/utils/controller.util'
import { RegisterChannelDto } from "./dto/register-channel.dto";

@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get("ids")
  @UseGuards(LoginGuard)
  async getChannelIds(@Req() req: Request, @Res() res: Response) {
    const pageable = getPageable(req.query)

    const channelIds = await this.channelService.getChannelIds(pageable)

    return res.status(200).json(channelIds);
  }

  @Get()
  @UseGuards(LoginGuard)
  async getChannels(@Req() req: Request, @Res() res: Response) {
    const pageable = getPageable(req.query)

    const channels = await this.channelService.getChannels(pageable)

    return res.status(200).json(channels);
  }

  @Get(":channelId")
  @UseGuards(LoginGuard)
  async getChannel(@Res() res: Response, @Param("channelId") channelId: string) {
    const channel = await this.channelService.getChannel(channelId)

    return res.status(200).json(channel)
  }

  @Get("states/open")
  @UseGuards(LoginGuard)
  async getOpenChannels(@Res() res: Response) {
    const openChannels = await this.channelService.getOpenChannels()

    return res.status(200).json(openChannels)
  }

  @Get("states/close")
  @UseGuards(LoginGuard)
  async getCloseChannels(@Res() res: Response) {
    const closeChannels = await this.channelService.getCloseChannels()

    return res.status(200).json(closeChannels)
  }

  @Post()
  @UseGuards(LoginGuard)
  async registerChannel(@Res() res: Response, @Body() registerChannelDto: RegisterChannelDto) {
    const created = await this.channelService.registerChannel(registerChannelDto)

    return res.status(201).location(`channels/${created.channelId}`).json(created)
  }

  @Delete(":channelId")
  @UseGuards(LoginGuard)
  async unregisterChannel(@Res() res: Response, @Param("channelId") channelId: string) {
    await this.channelService.unregisterChannel(channelId)

    return res.sendStatus(200)
  }
}