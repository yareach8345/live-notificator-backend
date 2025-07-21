import { Module } from '@nestjs/common'
import { ChannelImageService } from './channel-image.service'
import { ChannelImageStore } from './channel-image.store'
import { ChannelImageRepository } from './channel-image.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChannelImageEntity } from './channel-image.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelImageEntity]),
  ],
  exports: [ChannelImageService],
  providers: [ChannelImageService, ChannelImageRepository, ChannelImageStore],
})
export class ChannelImageModule {}