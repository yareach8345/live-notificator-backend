import { Module } from "@nestjs/common";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { ChannelRepository } from "./channel.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelEntity } from './channel.entity'
import { ChzzkModule } from '../chzzk/chzzk.module'
import { ChannelStore } from './channel.store'

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEntity]),
    ChzzkModule,
  ],
  providers: [ChannelService, ChannelRepository, ChannelStore],
  controllers: [ChannelController],
  exports: [ChannelStore]
})
export class ChannelModule {}