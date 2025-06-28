import { Injectable } from '@nestjs/common'
import { ImageDto } from './dto/image.dto'
import { ImageChangeCheckResult } from './dto/image-change.dto'

@Injectable()
export class ImageStore {
  private readonly storedImageMap: Map<string, ImageDto> = new Map()

  update(images: ImageDto[]) {
    this.storedImageMap.clear()
    images.forEach(imageDto => {
      this.storedImageMap.set(imageDto.channelId, imageDto)
    })
  }

  chackChange(recentImageInfos: ImageDto[]): ImageChangeCheckResult {
    const updated: ImageDto[] = []
    const unchanged: ImageDto[] = []
    const deleted: ImageDto[] = []

    const currentImageMap = new Map(this.storedImageMap)
    recentImageInfos.forEach(image => {
      const currentImage = currentImageMap.get(image.channelId)
      currentImageMap.delete(image.channelId)

      if(currentImage === undefined) {
        updated.push(image)
      } else if (currentImage.imageUrl !== image.imageUrl) {
        updated.push(image)
      } else {
        return unchanged.push(image)
      }
    })

    currentImageMap.forEach((image) => deleted.push(image))

    return {
      updated,
      unchanged,
      deleted
    }
  }
}