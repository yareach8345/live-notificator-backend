import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import {join} from 'path'
import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import { ChannelImageDto } from './dto/channel-image.dto'
import { ChannelImageStore } from './channel-image.store'
import * as sharp from 'sharp'
import { ChannelImageRepository } from './channel-image.repository'
import { generateDiffEvaluator } from '../commons/utils/evaluation.util'
import { channelInfoToChannelImage } from './channel-image.util'
import { ChannelService } from '../channel/channel.service'
import { ChannelChangeObserver } from '../channel/channel-change.notifier'
import { requireEnvArray } from '../commons/utils/env.util'

@Injectable()
export class ChannelImageService {
  readonly IMG_DIRECTORY = join(__dirname, '../../public/image')
  readonly IMG_SIZES = requireEnvArray('IMAGE_SIZES').map(sizeString => {
    return parseInt(sizeString, 10)
  })

  readonly CIRCLE_MASKS = new Map(this.IMG_SIZES.map(size => [
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

  readonly evolaute = generateDiffEvaluator<ChannelImageDto, 'channelId'>('channelId')

  readonly logger = new Logger(ChannelImageService.name)

  channelChangeObserver: ChannelChangeObserver<ChannelImageDto>

  constructor(
    private readonly imageStore: ChannelImageStore,
    private readonly channelImageRepository: ChannelImageRepository,
    channelService: ChannelService,
  ) {
    fsSync.mkdirSync(this.generateImgDirectoryPath('original'), { recursive: true })
    this.generateImgDirectoryPathBySize().map(path => fsSync.mkdirSync(path, { recursive: true }))

    this.initializeImageStore()
      .then( () => { this.logger.log("채널 이미지 저장소 초기화 완료") })
      .then( () => {
        this.channelChangeObserver = channelService.channelChangeSubscribe(channelInfoToChannelImage)
        this.channelChangeObserver.subscribe((er) => this.refreshImages([
          ...er.added,
          ...er.changed,
          ...er.unchanged
        ]))
      })
  }

  generateImgName(imageName: string) {
    return `${imageName}.png`
  }

  generateImgDirectoryPath(size: any) {
    return `${this.IMG_DIRECTORY}/size/${size}`
  }

  generateImgDirectoryPathBySize() {
    return [
      ...this.IMG_SIZES.map(size => this.generateImgDirectoryPath(size))
    ]
  }

  generateImgPath(imageName: string, size: any): string {
    return `${this.IMG_DIRECTORY}/size/${size}/${this.generateImgName(imageName)}`
  }

  generateImgPathsBySize(imageName: string) {
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
        this.generateImgDirectoryPath('original'),
        ...this.generateImgDirectoryPathBySize()
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

  private downloadAndSaveImage = async ({channelId, imageUrl} : ChannelImageDto) => {
    const response = await axios.get(
      imageUrl ?? "https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png",
      { responseType: 'arraybuffer' }
    )
    const imageBuffer = Buffer.from(response.data)

    //원본 이미지 저장
    await fs.writeFile(
      this.generateImgPath(channelId, 'original'),
      imageBuffer
    )

    //사이즈별 이미지 저장
    this.IMG_SIZES.map(async size => {
      return sharp(imageBuffer)
        .resize(size, size)
        .composite([{
          input: await this.CIRCLE_MASKS.get(size),
          blend: 'dest-in',
        }])
        .png()
        .toFile(this.generateImgPath(channelId, size))
    })
  }

  downloadChannelImage = async (imageDownloadDto: ChannelImageDto) => {
    this.logger.log(`이미지 다운로드 시작 : ${imageDownloadDto.channelId}`)
    await this.downloadAndSaveImage(imageDownloadDto)
    await this.channelImageRepository.saveChannelImage(imageDownloadDto)
    this.logger.log(`이미지 다운로드 완료 : ${this.generateImgName(imageDownloadDto.channelId)}`)
  }

  downloadChannelImages = async (imageDownloadDtos: ChannelImageDto[]) => {
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 시작`)
    await Promise.all(imageDownloadDtos.map(this.downloadAndSaveImage))
    await this.channelImageRepository.saveChannelImages(imageDownloadDtos)
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 완료`)
  }

  deleteImage = async (imageName: string) => {
    const imagePaths = [
      this.generateImgPath(imageName, 'original'),
      ...this.generateImgPathsBySize(imageName)
    ]

    await Promise.all(imagePaths.map(fs.unlink))
  }

  deleteChannelImage = async (channelId: string) => {
    await this.deleteImage(channelId)
    await this.channelImageRepository.deleteChannelImage(channelId)
    this.logger.log(`이미지 삭제 : ${this.generateImgName(channelId)}`)
  }

  deleteChannelImages = async (channelIds: string[]) => {
    await Promise.all(channelIds.map(this.deleteImage))
    await this.channelImageRepository.deleteChannelImages(channelIds)
    this.logger.log(`이미지 ${channelIds.length}개 삭제`)
  }

  refreshImages = async (newImageDtos: ChannelImageDto[]) => {
    const storedImages = this.imageStore.getChannelImages()
    const chackResult = this.evolaute(storedImages, newImageDtos)

    if(chackResult.deleted.length > 0) {
      console.log("deletec -> ", chackResult.deleted.map(c => c.channelId))
      await this.deleteChannelImages(chackResult.deleted.map(i => i.channelId))
    }

    if(chackResult.changed.length + chackResult.added.length > 0) {
      console.log("changed -> ", chackResult.changed.map(i => i.channelId))
      console.log("added -> ", chackResult.added.map(i => i.channelId))
      await this.downloadChannelImages([...chackResult.changed, ...chackResult.added])
    }

    this.imageStore.update(newImageDtos)
  }
}