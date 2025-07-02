import { Module } from '@nestjs/common'
import { ChannelImageService } from './channel-image.service'
import { ChannelImageStore } from './channel-image.store'
import { ChannelImageRepository } from './channel-image.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChannelImageEntity } from './channel-image.entity'
import { ChannelModule } from '../channel/channel.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelImageEntity]),
    ChannelModule
  ],
  exports: [ChannelImageService],
  providers: [ChannelImageService, ChannelImageRepository, ChannelImageStore],
})
export class ChannelImageModule {}