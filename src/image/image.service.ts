import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import {join} from 'path'
import * as fs from 'fs/promises'
import { mkdirSync } from 'fs'
import { ImageDto } from './dto/image.dto'
import { ImageStore } from './image.store'
import * as sharp from 'sharp'

@Injectable()
export class ImageService {
  static readonly IMG_DIRECTORY = join(__dirname, '../../public/image')
  static readonly IMG_SIZES = [100, 200]

  static readonly CIRCLE_MASKS = new Map(ImageService.IMG_SIZES.map(size => [
    size,
    sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: 'white', // 마스크는 단일 채널, 흰색이 보이는 부분
      },
    } as any)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
               <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="black"/>
             </svg>`
          ),
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer()
  ]))

  private readonly logger = new Logger(ImageService.name)

  constructor(
    private readonly imageStore: ImageStore
  ) {
    mkdirSync(ImageService.generateImgDirectoryPath('original'), { recursive: true })
    ImageService.generateImgDirectoryPathBySize().map(path => mkdirSync(path, { recursive: true }))
  }

  static generateImgName(imageName: string) {
    return `${imageName}.png`
  }

  static generateImgDirectoryPath(size: any) {
    return `${this.IMG_DIRECTORY}/size/${size}`
  }

  static generateImgDirectoryPathBySize() {
    return [
      ...this.IMG_SIZES.map(size => this.generateImgDirectoryPath(size))
    ]
  }

  static generateImgPath(imageName: string, size: any): string {
    return `${this.IMG_DIRECTORY}/size/${size}/${this.generateImgName(imageName)}`
  }

  static generateImgPathsBySize(imageName: string) {
    return [
      ...this.IMG_SIZES.map(size => this.generateImgPath(imageName, size),)
    ]
  }


  private async downloadAndSaveImage({channelId, imageUrl} : ImageDto) {
    const response = await axios.get(
      imageUrl ?? "https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png",
      { responseType: 'arraybuffer' }
    )
    const imageBuffer = Buffer.from(response.data)

    //원본 이미지 저장
    await fs.writeFile(
      ImageService.generateImgPath(channelId, 'original'),
      imageBuffer
    )

    //사이즈별 이미지 저장
    ImageService.IMG_SIZES.map(async size => {
      return sharp(imageBuffer)
        .resize(size, size)
        .composite([{
          input: await ImageService.CIRCLE_MASKS.get(size),
          blend: 'dest-in',
        }])
        .png()
        .toFile(ImageService.generateImgPath(channelId, size))
    })
  }

  async downloadChannelImage(imageDownloadDto: ImageDto) {
    this.logger.log(`이미지 다운로드 시작 : ${imageDownloadDto.channelId}`)
    await this.downloadAndSaveImage(imageDownloadDto)
    this.logger.log(`이미지 다운로드 완료 : ${ImageService.generateImgName(imageDownloadDto.channelId)}`)
  }

  async downloadChannelImages(imageDownloadDtos: ImageDto[]) {
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 시작`)
    await Promise.all(imageDownloadDtos.map(this.downloadAndSaveImage))
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 완료`)
  }

  async deleteImage(imageName: string) {
    await fs.unlink(ImageService.generateImgPath(imageName, 'original'))
    await Promise.all(ImageService.generateImgPathsBySize(imageName).map(fs.unlink))
  }

  async deleteChannelImage(channelId: string) {
    await this.deleteImage(channelId)
    this.logger.log(`이미지 삭제 : ${ImageService.generateImgName(channelId)}`)
  }

  async deleteChannelImages(channelIds: string[]) {
    await Promise.all(channelIds.map(this.deleteImage))
    this.logger.log(`이미지 ${channelIds.length}개 삭제`)
  }

  async refreshImage(newImageDto: ImageDto) {
    const chackResult = this.imageStore.evaluateImageChange(newImageDto)
    switch (chackResult) {
      case "new":
      case "updated":
        await this.downloadChannelImage(newImageDto)
        break;
      case "unchanged":
        break;
      default:
        this.logger.warn("처리되지 않은 이미지 상태 처리 확인 필요")
    }
  }

  async refreshImages(newImageDtos: ImageDto[]) {
    const chackResult = this.imageStore.evaluateImagesChange(newImageDtos)

    if(chackResult.deleted.length > 0) {
      await this.deleteChannelImages(chackResult.deleted.map(i => i.channelId))
    }

    if(chackResult.updated.length + chackResult.added.length > 0) {
      await this.downloadChannelImages([...chackResult.updated, ...chackResult.added])
    }

    this.imageStore.update(newImageDtos)
  }
}