import { Injectable } from '@nestjs/common'
import { ChannelImageDto } from './dto/channel-image.dto'

@Injectable()
export class ChannelImageStore {
  private storedImage: ChannelImageDto[] = []
  
  update(images: ChannelImageDto[]) {
    this.storedImage = images
  }

  getChannelImages() {
    return this.storedImage
  }
}