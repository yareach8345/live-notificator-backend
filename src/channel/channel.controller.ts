import { Response, Request } from "express";
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { LoginGuard } from '../auth/guards/login.guard'
import { ChannelService } from "./channel.service"
import { getPageable } from '../commons/utils/controller.util'
import { RegisterChannelDto } from "./dto/register-channel.dto";
import { EditChannelDto } from './dto/edit-channel.dto'

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

  @Get(":platform/:id")
  @UseGuards(LoginGuard)
  async getChannel(
    @Res() res: Response,
    @Param("platform") platform: string,
    @Param("id") id: string
  ) {
    const channel = await this.channelService.getChannel({ platform, id })

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

    return res.status(201).location(`channels/${created.channelId.platform}${created.channelId.id}`).json(created)
  }

  @Patch(":platform/:id")
  @UseGuards(LoginGuard)
  async updateChannel(
    @Res() res: Response,
    @Param("platform") platform: string,
    @Param("id") id: string,
    @Body() editDto: EditChannelDto
  ) {
    const channelId = {
      platform: platform,
      id: id,
    }
    const result = await this.channelService.updateChannel(channelId, editDto)

    return res.status(200).json(result)
  }

  @Delete(":platform/:id")
  @UseGuards(LoginGuard)
  async unregisterChannel(
    @Res() res: Response,
    @Param("platform") platform: string,
    @Param("id") id: string
  ) {
    await this.channelService.unregisterChannel({ platform, id })

    return res.sendStatus(200)
  }

  @Get(":platform/:id/state")
  @UseGuards(LoginGuard)
  getChannelState(
    @Res() res: Response,
    @Param("platform") platform: string,
    @Param("id") id: string
  ) {
    const result = this.channelService.getChannelState({ platform, id })

    return res.status(200).send(result)
  }

  @Get(":platform")
  @UseGuards(LoginGuard)
  async getChannelByPlatform(
    @Res() res: Response,
    @Param("platform") platform: string,
  ) {
    const channels = await this.channelService.getChannelsByPlatform(platform)

    return res.status(200).send(channels)
  }
}