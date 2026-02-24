import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { YoutubeService } from './youtube.service'
import { LoginGuard } from 'src/auth/guards/login.guard'

// 테스트용 엔드포인트로 추정. 확인후 문제 없을 시 삭제 예정
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