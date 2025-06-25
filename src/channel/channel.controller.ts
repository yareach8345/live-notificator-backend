import { Response, Request } from "express";
import { Controller, Get, Param, Req, Res, UseGuards } from "@nestjs/common";
import { LoginGuard } from '../auth/auth.guard'
import { ChannelService } from "./channel.service"
import { getPageable } from '../commons/utils/controller.util'

@Controller('channels')
@UseGuards(LoginGuard)
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get("/ids")
  async getChannelIds(@Req() req: Request, @Res() res: Response) {
    const pageable = getPageable(req.query)

    const channelIds = await this.channelService.getChannelIds(pageable)

    return res.status(200).send(channelIds);
  }

  @Get()
  async getChannels(@Req() req: Request, @Res() res: Response) {
    const pageable = getPageable(req.query)

    const channels = await this.channelService.getChannels(pageable)

    return res.status(200).send(channels);
  }

  @Get("/:channelId")
  async getChannel(@Res() res: Response, @Param("channelId") channelId: string) {
    const channel = await this.channelService.getChannel(channelId)

    return res.status(200).send(channel)
  }
}