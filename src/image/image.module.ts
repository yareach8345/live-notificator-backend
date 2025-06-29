import { Module } from '@nestjs/common'
import { ImageService } from './image.service'
import { ImageStore } from './image.store'
import { ChannelImageRepository } from './channel-image.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChannelImageEntity } from './channel-image.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ChannelImageEntity])],
  exports: [ImageService],
  providers: [ImageService, ImageStore, ChannelImageRepository],
})
export class ImageModule {}