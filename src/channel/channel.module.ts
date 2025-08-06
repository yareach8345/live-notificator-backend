import { Module } from "@nestjs/common";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { ChannelRepository } from "./channel.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelEntity } from './channel.entity'
import { ChzzkModule } from '../chzzk/chzzk.module'
import { ChannelStore } from './channel.store'
import { YoutubeModule } from '../youtube/youtube.module'
import { PlatformServiceDispatcher } from './platform-service.dispatcher'
import { ChannelImageModule } from '../channel-image/channel-image.module'
import { NotifierModule } from '../notifier/notifier.module'
import { MessageDispatcherModule } from '../message-dispatcher/message-dispatcher.module'
import { ChannelStateNotifier } from '../notifier/channel-state.notifier'
import { ChannelImageNotifier } from '../notifier/channel-image.notifier'
import { ChannelInfoNotifier } from '../notifier/channel-info.notifier'
import { MessageDispatcherService } from '../message-dispatcher/message-dispatcher.service'
import { SseModule } from '../sse/sse.module'
import { MqttModule } from "src/mqtt/mqtt.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEntity]),
    ChannelImageModule,
    ChzzkModule,
    YoutubeModule,
    MessageDispatcherModule,
    NotifierModule,
    MqttModule,
    SseModule
  ],
  providers: [
    ChannelService,
    ChannelRepository,
    ChannelStore,
    PlatformServiceDispatcher,
    ChannelStateNotifier,
    ChannelImageNotifier,
    ChannelInfoNotifier,
    MessageDispatcherService
  ],
  controllers: [ChannelController],
  exports: [ChannelService]
})
export class ChannelModule {}