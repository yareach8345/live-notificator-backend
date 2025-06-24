import { Response, Request } from "express";
import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { LoginGuard } from '../auth/auth.guard'
import { ChannelService } from "./channel.service"

@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get()
  @UseGuards(LoginGuard)
  async getChannels(@Req() req: Request, @Res() res: Response) {
    const page = Number(req.query.page || 1)
    const pageSize = Number(req.query.pageSize || 10)

    const channelIds = await this.channelService.getChannelIdsWithPage(page, pageSize)

    return res.status(200).send(channelIds);
  }
}