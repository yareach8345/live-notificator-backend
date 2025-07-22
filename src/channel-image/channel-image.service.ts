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
import { difference, differenceWith, intersection, isEqual, union } from 'lodash'
import { RuntimeException } from '@nestjs/core/errors/exceptions'
import { BehaviorSubject, firstValueFrom, map } from 'rxjs'

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

  private readonly imageNameRegex = new RegExp('^(?<platform>chzzk|youtube)-(?<id>[^.]+).png$')

  readonly evolute = generateDiffEvaluator<ChannelImageDto>()

  readonly logger = new Logger(ChannelImageService.name)

  constructor(
    private readonly imageStore: ChannelImageStore,
    private readonly channelImageRepository: ChannelImageRepository,
  ) {
    fsSync.mkdirSync(this.generateImgDirectoryPath('original'), { recursive: true })
    this.generateImgDirectoryPathBySize().forEach(path => fsSync.mkdirSync(path, { recursive: true }))

    this.initImages().then(() => {
      this.logger.log('채널 이미지 초기화 완료')
    })
  }

  // 목적
  // 1. 데이터베이스에 저장된 이미지만 남아있게 하기
  // 2. 모든 사이즈가 다 있는 이미지만 남아있게 하기
  async initImages() {
    const imageInfosInDB = await this.channelImageRepository.getAllChannelImages()
    const channelIdInDB = imageInfosInDB.map(channel => channel.channelId)

    const directories = [ this.generateImgDirectoryPath('original'), ...this.generateImgDirectoryPathBySize() ]
    const imageNamesByDirectory = await Promise.all(directories.map(dir => fs.readdir(dir)))

    const allImageNames$ = new BehaviorSubject(imageNamesByDirectory.reduce((prev, curr) => union(prev, curr), []))
    const channelIdOfAllImage$ = allImageNames$.pipe(map(imageNames => imageNames.map(this.imageNameToChannelId)))

    //디렉터리에 있으나 DB에는 없는 파일 삭제
    const imageNamesNotInDB = differenceWith<ChannelId, ChannelId>(
      await firstValueFrom(channelIdOfAllImage$),
      channelIdInDB,
      isEqual
    )
    if(imageNamesNotInDB.length > 0) {
      this.logger.log(`DB에 존재하지 않은 ${imageNamesNotInDB.length}개의 정보를 삭제합니다..`)
      await Promise.all( imageNamesNotInDB.map(this.deleteImage) )
      //'모든 파일 명 - 삭제되 파일 명'으로 allImageNames를 갱신
      allImageNames$.next( difference(allImageNames$.getValue(), imageNamesNotInDB.map(this.generateImgName)) )
      this.logger.log(`DB에 존재하지 않은 ${imageNamesNotInDB.length}개의 정보를 삭제했습니다.`)
    }
    //assert DB에 없는 파일은 디렉터리에 없다

    //모든 디렉터리에 포함되어있지 않은 이미지는 다시 다운로드
    const imageNamesInAllDirectories = imageNamesByDirectory.reduce((prev, curr) => intersection(prev, curr), allImageNames$.getValue())
    const imageNamesNotInAllDirectories = difference(allImageNames$.getValue(), imageNamesInAllDirectories)

    if(imageNamesNotInAllDirectories.length > 0) {
      const imageCount = imageNamesNotInAllDirectories.length
      const channelIds = imageNamesNotInAllDirectories.map(this.imageNameToChannelId)
      const channelInfos = await this.channelImageRepository.getChannelImagesByChannelId(channelIds)
      this.logger.log(`모든 디렉터리에 포함되지 않은 이미지 ${imageCount}개를 다시 다운로드.`)
      await this.downloadChannelImages(channelInfos)
      this.logger.log(`모든 디렉터리에 포함되지 않은 이미지 ${imageCount}개 다운로드 완료.`)
    }
    //assert 모든 파일에 들어있는 이미지 목록 = 모든 파일 목록


    //DB에만 있는 이미지는 다운로드
    //(DB에 있는 이미지의 ID - 저장된 모든 파일의 ID) => DB에만 있는 이미지의 ID
    const channelIdsInOnlyDB =
      differenceWith<ChannelId, ChannelId>(
        imageInfosInDB.map(image => image.channelId),
        await firstValueFrom(channelIdOfAllImage$),
        isEqual
      )

    if(channelIdsInOnlyDB.length > 0) {
      const imageCount = channelIdsInOnlyDB.length
      const channelInfos = await this.channelImageRepository.getChannelImagesByChannelId(channelIdsInOnlyDB)
      this.logger.log(`DB에만 존재하는 이미지 ${imageCount}개를 다시 다운로드.`)
      await this.downloadChannelImages(channelInfos)
      allImageNames$.next([
        ...allImageNames$.getValue(),
        ...channelIdsInOnlyDB.map(this.generateImgName)
      ])
      this.logger.log(`DB에만 존재하는 이미지 이미지 ${imageCount}개 다운로드 완료.`)
    }
    //assert DB에 있는 이미지는 다 폴더 안에 존재

    //위의 작업 후 예상 결과
    //
    //assert DB에 없는 파일은 디렉터리에 없다
    //assert DB에 있는 이미지는 다 폴더 안에 존재
    // == DB와 디렉터리에 있는 이미지는 동일
    //
    //assert 모든 파일에 들어있는 이미지 목록 = 모든 파일 목록

    this.imageStore.update(imageInfosInDB)
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

  imageNameToChannelId = (imageName: string): ChannelId => {
    const regexResult = imageName.match(this.imageNameRegex)

    if(!regexResult?.groups || !regexResult.groups['platform'] || !regexResult.groups['id']) {
      throw new RuntimeException(`파일 이름 매칭 실패 잘못된 파일 형식: ${imageName}`)
    }

    return {
      platform: regexResult.groups['platform'],
      id: regexResult.groups['id']
    }
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

    this.logger.log(`이미지 변경 사항 [추가 : ${chackResult.added.length}, 삭제: ${chackResult.deleted.length}, 변경: ${chackResult.changed.length}, 유지:${chackResult.unchanged.length}]`)

    if(chackResult.deleted.length > 0) {
      await this.deleteChannelImages(chackResult.deleted.map(i => i.channelId))
    }

    if(chackResult.changed.length + chackResult.added.length > 0) {
      await this.downloadChannelImages([...chackResult.changed, ...chackResult.added])
    }

    this.imageStore.update(newImageDtos)
  }
}