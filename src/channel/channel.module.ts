import { Module } from "@nestjs/common";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { ChannelRepository } from "./channel.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelEntity } from './channel.entity'
import { ChzzkModule } from '../chzzk/chzzk.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEntity]),
    ChzzkModule
  ],
  providers: [ChannelService, ChannelRepository],
  controllers: [ChannelController],
})
export class ChannelModule {}