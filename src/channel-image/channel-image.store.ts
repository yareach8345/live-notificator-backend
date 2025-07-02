import { Injectable } from '@nestjs/common'
import { ChannelImageDto } from './dto/channel-image.dto'
import { EvaluationResultDto } from '../commons/dto/evaluation-result.dto'
import { generateEvaluator } from '../commons/utils/evaluation.util'
import { CompareResult } from '../commons/types/compare.type'

@Injectable()
export class ChannelImageStore {
  private readonly storedImageMap: Map<string, ChannelImageDto> = new Map()
  
  private readonly evaluateImages = generateEvaluator<ChannelImageDto, 'channelId'>('channelId')

  update(images: ChannelImageDto[]) {
    this.storedImageMap.clear()
    images.forEach(imageDto => {
      this.storedImageMap.set(imageDto.channelId, imageDto)
    })
  }

  private compareImage(originalImage: ChannelImageDto, comparisonImage: ChannelImageDto) {
    return originalImage.imageUrl !== comparisonImage.imageUrl
  }

  evaluateImageChange(other: ChannelImageDto): CompareResult {
    const currentImage = this.storedImageMap.get(other.channelId)

    return currentImage === undefined ? 'new' : this.compareImage(currentImage, other) ? 'changed' : 'unchanged'
  }
  
  evaluateImagesChange(recentImageInfos: ChannelImageDto[]): EvaluationResultDto<ChannelImageDto>{
    return this.evaluateImages(this.storedImageMap, recentImageInfos)
  }
}