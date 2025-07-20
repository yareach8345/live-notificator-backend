import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { YoutubeService } from './youtube.service'
import { LoginGuard } from 'src/auth/guards/login.guard'

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get(':channelId')
  @UseGuards(LoginGuard)
  async getChannelInfo(
    @Res() response: Response,
    @Param('channelId') channelId: string
  ) {
    const result = await this.youtubeService.getChannelInfo(channelId)

    response.status(200).send(result)
  }
}