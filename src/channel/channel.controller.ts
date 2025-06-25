import { Response, Request } from "express";
import { Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { LoginGuard } from '../auth/auth.guard'
import { ChannelService } from "./channel.service"
import { getPageable } from '../commons/utils/controller.util'
import { RegisterChannelDto } from "./dto/register-channel.dto";

@Controller('channels')
@UseGuards(LoginGuard)
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get("ids")
  async getChannelIds(@Req() req: Request, @Res() res: Response) {
    const pageable = getPageable(req.query)

    const channelIds = await this.channelService.getChannelIds(pageable)

    return res.status(200).json(channelIds);
  }

  @Get()
  async getChannels(@Req() req: Request, @Res() res: Response) {
    const pageable = getPageable(req.query)

    const channels = await this.channelService.getChannels(pageable)

    return res.status(200).json(channels);
  }

  @Get(":channelId")
  async getChannel(@Res() res: Response, @Param("channelId") channelId: string) {
    const channel = await this.channelService.getChannel(channelId)

    return res.status(200).json(channel)
  }

  @Post()
  async registerChannel(@Res() res: Response, @Body() registerChannelDto: RegisterChannelDto) {
    const created = await this.channelService.registerChannel(registerChannelDto)

    return res.status(201).json(created).location(`channels/${created.channelId}`)
  }

  @Delete(":channelId")
  async unregisterChannel(@Res() res: Response, @Param("channelId") channelId: string) {
    await this.channelService.unregisterChannel(channelId)

    return res.sendStatus(200)
  }
}