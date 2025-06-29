import { Injectable } from '@nestjs/common'
import { ChannelImageDto } from './dto/channel-image.dto'
import { ChannelImageEvaluationResult } from './dto/channel-image-evaluation-result.dto'

@Injectable()
export class ChannelImageStore {
  private readonly storedImageMap: Map<string, ChannelImageDto> = new Map()

  update(images: ChannelImageDto[]) {
    this.storedImageMap.clear()
    images.forEach(imageDto => {
      this.storedImageMap.set(imageDto.channelId, imageDto)
    })
  }

  evaluateImageChange(imageDto: ChannelImageDto): 'updated' | 'unchanged' | 'new' {
    const currentImage = this.storedImageMap.get(imageDto.channelId)

    if(currentImage === undefined) {
      return 'new'
    } else if (currentImage.imageUrl !== imageDto.imageUrl) {
      return 'updated'
    } else {
      return 'unchanged'
    }
  }

  evaluateImagesChange(recentImageInfos: ChannelImageDto[]): ChannelImageEvaluationResult {
    const added: ChannelImageDto[] = []
    const updated: ChannelImageDto[] = []
    const unchanged: ChannelImageDto[] = []
    const deleted: ChannelImageDto[] = []

    const currentImageMap = new Map(this.storedImageMap)
    recentImageInfos.forEach(image => {
      currentImageMap.delete(image.channelId)

      const determineResult = this.evaluateImageChange(image)

      if(determineResult === 'new') {
        added.push(image)
      } else if (determineResult === 'updated') {
        updated.push(image)
      } else {
        return unchanged.push(image)
      }
    })

    currentImageMap.forEach((image) => deleted.push(image))

    return {
      added,
      updated,
      unchanged,
      deleted
    }
  }
}