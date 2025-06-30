import { Injectable } from '@nestjs/common'
import { ChannelImageDto } from './dto/channel-image.dto'
import { EvaluationResultDto } from '../commons/dto/evaluation-result.dto'
import { CompareResult, evaluateDiff } from '../commons/utils/evaluation.util'

@Injectable()
export class ChannelImageStore {
  private readonly storedImageMap: Map<string, ChannelImageDto> = new Map()
  
  private readonly evaluateImages = evaluateDiff("channelId",this.compareImage)

  update(images: ChannelImageDto[]) {
    this.storedImageMap.clear()
    images.forEach(imageDto => {
      this.storedImageMap.set(imageDto.channelId, imageDto)
    })
  }

  private compareImage(originalImage: ChannelImageDto | undefined, comparisonImage: ChannelImageDto): CompareResult {
    if(originalImage === undefined) {
      return 'new'
    } else if (originalImage.imageUrl !== comparisonImage.imageUrl) {
      return 'updated'
    } else {
      return 'unchanged'
    }
  }

  evaluateImageChange(other: ChannelImageDto): 'updated' | 'unchanged' | 'new' {
    const currentImage = this.storedImageMap.get(other.channelId)

    return this.compareImage(currentImage, other)
  }
  
  evaluateImagesChange(recentImageInfos: ChannelImageDto[]): EvaluationResultDto<ChannelImageDto>{
    return this.evaluateImages(this.storedImageMap, recentImageInfos)
  }
}