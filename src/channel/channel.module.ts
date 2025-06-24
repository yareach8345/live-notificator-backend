import { Module } from "@nestjs/common";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { ChannelRepository } from "./channel.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelEntity } from './channel.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ChannelEntity])],
  providers: [ChannelService, ChannelRepository],
  controllers: [ChannelController],
})
export class ChannelModule {}