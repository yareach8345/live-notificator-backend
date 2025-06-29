import { Module } from "@nestjs/common";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { ChannelRepository } from "./channel.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelEntity } from './channel.entity'
import { ChzzkModule } from '../chzzk/chzzk.module'
import { ChannelStore } from './channel.store'
import { ChannelImageModule } from '../channel-image/channel-image.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEntity]),
    ChzzkModule,
    ChannelImageModule,
  ],
  providers: [ChannelService, ChannelRepository, ChannelStore],
  controllers: [ChannelController],
})
export class ChannelModule {}