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
import { requireEnvArray } from '../commons/utils/env.util'
import { ChannelId } from '../commons/types/channel-id.type'

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

  readonly evolute = generateDiffEvaluator<ChannelImageDto>()

  readonly logger = new Logger(ChannelImageService.name)

  constructor(
    private readonly imageStore: ChannelImageStore,
    private readonly channelImageRepository: ChannelImageRepository,
  ) {
    fsSync.mkdirSync(this.generateImgDirectoryPath('original'), { recursive: true })
    this.generateImgDirectoryPathBySize().forEach(path => fsSync.mkdirSync(path, { recursive: true }))
  }

  //이미지가 들어있는 디렉터리와 이미지 명에 대한 코드
  //public 하위 /size/{size}/{platform}-{channelId}.png 형식으로 저장
  //유튜브의 채널아이디가 abc인 채널의 200px크기의 이미지를 얻어오기 위해서는 /size/200/youtube-abc.png를 불러와야 함

  generateImgName(channelId: ChannelId) {
    return `${channelId.platform}-${channelId.id}.png`
  }

  generateImgDirectoryPath(size: any) {
    return `${this.IMG_DIRECTORY}/size/${size}`
  }

  generateImgDirectoryPathBySize = () => {
    return [
      ...this.IMG_SIZES.map(size => this.generateImgDirectoryPath(size))
    ]
  }

  generateImgPath(channelId: ChannelId, size: any): string {
    return `${this.IMG_DIRECTORY}/size/${size}/${this.generateImgName(channelId)}`
  }

  generateImgPathsBySize(channelId: ChannelId) {
    return [
      ...this.IMG_SIZES.map(size => this.generateImgPath(channelId, size),)
    ]
  }

  // 채널 이미지 저장과 삭제, 다운로드에 대한 코드
  // 이미지를 저장, 삭제하는 코드는 db 조작을 포함함

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
    const channelId = imageDownloadDto.channelId
    this.logger.log(`이미지 다운로드 시작 : ${channelId.id}/${channelId.id}`)
    await this.downloadAndSaveImage(imageDownloadDto)
    await this.channelImageRepository.saveChannelImage(imageDownloadDto)
    this.logger.log(`이미지 다운로드 완료 : ${channelId.id}/${channelId.id}`)
  }

  downloadChannelImages = async (imageDownloadDtos: ChannelImageDto[]) => {
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 시작`)
    await Promise.all(imageDownloadDtos.map(this.downloadAndSaveImage))
    await this.channelImageRepository.saveChannelImages(imageDownloadDtos)
    this.logger.log(`이미지 ${imageDownloadDtos.length}개 다운로드 완료`)
  }

  deleteImage = async (channelId: ChannelId) => {
    const imagePaths = [
      this.generateImgPath(channelId, 'original'),
      ...this.generateImgPathsBySize(channelId)
    ]

    await Promise.all(imagePaths.map(fs.unlink))
  }

  deleteChannelImage = async (channelId: ChannelId) => {
    await this.deleteImage(channelId)
    await this.channelImageRepository.deleteChannelImage(channelId)
    this.logger.log(`이미지 삭제 : ${this.generateImgName(channelId)}`)
  }

  deleteChannelImages = async (channelIds: ChannelId[]) => {
    await Promise.all(channelIds.map(this.deleteImage))
    await this.channelImageRepository.deleteChannelImages(channelIds)
    this.logger.log(`이미지 ${channelIds.length}개 삭제`)
  }

  refreshImages = async (newImageDtos: ChannelImageDto[]) => {
    const storedImages = this.imageStore.getChannelImages()
    const chackResult = this.evolute(storedImages, newImageDtos)

    if(chackResult.deleted.length > 0) {
      console.log("deleted -> ", chackResult.deleted.map(c => c.channelId))
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