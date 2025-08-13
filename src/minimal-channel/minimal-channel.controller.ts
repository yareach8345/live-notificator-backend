import { Controller, Get, Param, Req, Res, UseGuards } from "@nestjs/common";
import { MinimalChannelService } from './minimal-channel.service'
import { Request, Response } from 'express'
import { getIdStrings, getPageable } from '../commons/utils/controller.util'
import { HeaderOrLoginAuthGuard } from '../auth/guards/header-or-login-auth.guard'
import { LoginGuard } from '../auth/guards/login.guard'

@Controller('channels/minimal')
export class MinimalChannelController {

  constructor( private readonly minimalChannelService: MinimalChannelService) { }

  @Get()
  @UseGuards(HeaderOrLoginAuthGuard)
  async getChannels(@Req() req: Request, @Res() res: Response) {
    const pageable = getPageable(req.query)

    const idStrings = getIdStrings(req.query)

    const channels = await this.minimalChannelService.getChannels(pageable, idStrings)

    return res.status(200).json(channels);
  }

  @Get(":platform/:id")
  @UseGuards(HeaderOrLoginAuthGuard)
  async getChannel(
    @Res() res: Response,
    @Param("platform") platform: string,
    @Param("id") id: string
  ) {
    const channel = await this.minimalChannelService.getChannel({ platform, id })

    return res.status(200).json(channel)
  }

  @Get("states/open")
  @UseGuards(HeaderOrLoginAuthGuard)
  async getOpenChannels(@Res() res: Response) {
    const openChannels = await this.minimalChannelService.getOpenChannels()

    return res.status(200).json(openChannels)
  }

  @Get("states/close")
  @UseGuards(HeaderOrLoginAuthGuard)
  async getCloseChannels(@Res() res: Response) {
    const closeChannels = await this.minimalChannelService.getCloseChannels()

    return res.status(200).json(closeChannels)
  }


  @Get(":platform/:id/state")
  @UseGuards(LoginGuard)
  getChannelState(
    @Res() res: Response,
    @Param("platform") platform: string,
    @Param("id") id: string
  ) {
    const result = this.minimalChannelService.getChannelState({ platform, id })

    return res.status(200).send(result)
  }
}