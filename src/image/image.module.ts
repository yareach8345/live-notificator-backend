import { Module } from '@nestjs/common'
import { ImageService } from './image.service'
import { ImageStore } from './image.store'

@Module({
  exports: [ImageService],
  providers: [ImageService, ImageStore],
})
export class ImageModule {}