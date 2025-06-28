import { Injectable } from '@nestjs/common'
import { ImageDto } from './dto/image.dto'
import { ImageEvaluationResult } from './dto/image-change.dto'

@Injectable()
export class ImageStore {
  private readonly storedImageMap: Map<string, ImageDto> = new Map()

  update(images: ImageDto[]) {
    this.storedImageMap.clear()
    images.forEach(imageDto => {
      this.storedImageMap.set(imageDto.channelId, imageDto)
    })
  }

  evaluateImageChange(imageDto: ImageDto): 'updated' | 'unchanged' | 'new' {
    const currentImage = this.storedImageMap.get(imageDto.channelId)

    if(currentImage === undefined) {
      return 'new'
    } else if (currentImage.imageUrl !== imageDto.imageUrl) {
      return 'updated'
    } else {
      return 'unchanged'
    }
  }

  evaluateImagesChange(recentImageInfos: ImageDto[]): ImageEvaluationResult {
    const added: ImageDto[] = []
    const updated: ImageDto[] = []
    const unchanged: ImageDto[] = []
    const deleted: ImageDto[] = []

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