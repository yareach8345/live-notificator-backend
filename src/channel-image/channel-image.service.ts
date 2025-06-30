import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import {join} from 'path'
import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import { ChannelImageDto } from './dto/channel-image.dto'
import { ChannelImageStore } from './channel-image.store'
import * as sharp from 'sharp'
import { ChannelImageRepository } from './channel-image.repository'

@Injectable()
export class ChannelImageService {
  static readonly IMG_DIRECTORY = join(__dirname, '../../public/image')
  static readonly IMG_SIZES = [100, 200]

  static readonly CIRCLE_MASKS = new Map(ChannelImageService.IMG_SIZES.map(size => [
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

  private readonly logger = new Logger(ChannelImageService.name)

  constructor(
    private readonly imageStore: ChannelImageStore,
    private readonly channelImageRepository: ChannelImageRepository,
  ) {
    fsSync.mkdirSync(ChannelImageService.generateImgDirectoryPath('original'), { recursive: true })
    ChannelImageService.generateImgDirectoryPathBySize().map(path => fsSync.mkdirSync(path, { recursive: true }))

    this.initializeImageStore().then( () => {
      this.logger.log("채널 이미지 저장소 초기화 완료")
    })
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

  private async initializeImageStore() {
    const channelImageRecords = await this.channelImageRepository.getAllChannelImages()

    this.imageStore.update( channelImageRecords )

    const channelIdsOfRecordedImages = channelImageRecords.map(i => i.channelId)
    const imageNamesBySizeDir = await Promise.all(
      [
        ChannelImageService.generateImgDirectoryPath('original'),
        ...ChannelImageService.generateImgDirectoryPathBySize()
      ].map(path => fs.readdir(path))
    )

    const channelIdsWithIntactImage = new Set(
      imageNamesBySizeDir
        .map(set => set.map(filename => filename.substring(0, filename.lastIndexOf('.'))))
        .map(imageNames => new Set(imageNames))
        .reduce((prev, curr) => {
          return prev.filter(x => curr.has(x))
        }, channelIdsOfRecordedImages)
    )

    const channelIdsWithMissingImage = new Set(channelIdsOfRecordedImages.filter(x => !channelIdsWithIntactImage.has(x)))

    await this.downloadChannelImages(channelImageRecords.filter(i => channelIdsWithMissingImage.has(i.channelId)))
  }

  private async downloadAndSaveImage({channelId, imageUrl} : ChannelImageDto) {
    const response = await axios.get(
      imageUrl ?? "https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png",
      { responseType: 'arraybuffer' }
    )
    const imageBuffer = Buffer.from(response.data)

    //원본 이미지 저장
    await fs.writeFile(
      ChannelImageService.generateImgPath(channelId, 'original'),
      imageBuffer
    )

    //사이즈별 이미지 저장
    ChannelImageService.IMG_SIZES.map(async size => {
      return sharp(imageBuffer)
        .resize(size, size)
        .composite([{
          input: await ChannelImageService.CIRCLE_MASKS.get(size),
          blend: 'dest-in',
        }])
        .png()
        .toFile(ChannelImageService.generateImgPath(channelId, size))
    })
  }

  async downloadChannelImage(imageDownloadDto: ChannelImageDto) {
    this.logger.log(`이미지 다운로드 시작 : ${imageDownloadDto.channelId}`)
    await this.downloadAndSaveImage(imageDownloadDto)
    await this.channelImageRepository.saveChannelImage(imageDownloadDto)
    this.logger.log(`이미지 다운로드 완료 : ${ChannelImageService.generateImgName(imageDownloadDto.channelId)}`)
  }

  async downloadChannelImages(imageDownloadDtos: ChannelImageDto[]) {
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 시작`)
    await Promise.all(imageDownloadDtos.map(this.downloadAndSaveImage))
    await this.channelImageRepository.saveChannelImages(imageDownloadDtos)
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 완료`)
  }

  async deleteImage(imageName: string) {
    await fs.unlink(ChannelImageService.generateImgPath(imageName, 'original'))
    await Promise.all(ChannelImageService.generateImgPathsBySize(imageName).map(fs.unlink))
  }

  async deleteChannelImage(channelId: string) {
    await this.deleteImage(channelId)
    this.logger.log(`이미지 삭제 : ${ChannelImageService.generateImgName(channelId)}`)
  }

  async deleteChannelImages(channelIds: string[]) {
    await Promise.all(channelIds.map(this.deleteImage))
    this.logger.log(`이미지 ${channelIds.length}개 삭제`)
  }

  async refreshImage(newImageDto: ChannelImageDto) {
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

  async refreshImages(newImageDtos: ChannelImageDto[]) {
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