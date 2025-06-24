import { Response, Request } from "express";
import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { LoginGuard } from '../auth/auth.guard'
import { ChannelService } from "./channel.service"
import { Pageable } from '../commons/types/database'

@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get()
  @UseGuards(LoginGuard)
  async getChannels(@Req() req: Request, @Res() res: Response) {
    const pageable: Pageable | undefined = req.query.page ? {
      page: Number(req.query.page), pageSize: Number(req.query.pageSize || 10),
    } : undefined
    const channelIds = await this.channelService.getChannelIdsWithPage(pageable)

    return res.status(200).send(channelIds);
  }
}