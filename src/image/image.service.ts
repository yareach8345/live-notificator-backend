import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import {join} from 'path'
import * as fs from 'fs/promises'
import { ImageDto } from './dto/image.dto'

@Injectable()
export class ImageService {
  static readonly IMG_DIRECTORY = join(__dirname, '../../public/image')
  private readonly logger = new Logger(ImageService.name)

  private async download({channelId, imageUrl} : ImageDto) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data)

    console.log(imageUrl)
    console.log(`${ImageService.IMG_DIRECTORY}/size/original/${channelId}.png`)
    await fs.mkdir(`${ImageService.IMG_DIRECTORY}/size/original`, {recursive: true})
    await fs.writeFile(`${ImageService.IMG_DIRECTORY}/size/original/${channelId}.png`, imageBuffer)
  }

  async downloadImage(imageDownloadDto: ImageDto) {
    this.logger.log(`이미지 다운로드 시작 : ${imageDownloadDto.channelId}`)
    await this.download(imageDownloadDto)
    this.logger.log(`이미지 다운로드 완료 : ${imageDownloadDto.channelId}`)
  }

  async downloadImages(imageDownloadDtos: ImageDto[]) {
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 시작`)
    await Promise.all(imageDownloadDtos.map(this.download))
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 완료`)
  }
}