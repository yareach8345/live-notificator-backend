import { Module } from "@nestjs/common";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { ChannelRepository } from "./channel.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelEntity } from './channel.entity'
import { ChzzkModule } from '../chzzk/chzzk.module'
import { ChannelStore } from './channel.store'
import { ChannelStateWatcher } from './channel-state.watcher'
import { MessageDispatcherModule } from '../message-dispatcher/message-dispatcher.module'
import { YoutubeModule } from '../youtube/youtube.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEntity]),
    ChzzkModule,
    YoutubeModule,
    MessageDispatcherModule,
  ],
  providers: [ChannelService, ChannelRepository, ChannelStore, ChannelStateWatcher],
  controllers: [ChannelController],
  exports: [ChannelService]
})
export class ChannelModule {}