import { Module } from '@nestjs/common'
import { ChannelModule } from '../channel/channel.module'
import { MinimalChannelController } from './minimal-channel.controller'
import { MinimalChannelService } from './minimal-channel.service'
import { MessageDispatcherModule } from '../message-dispatcher/message-dispatcher.module'

@Module({
  imports: [
    ChannelModule,
    MessageDispatcherModule,
  ],
  providers: [MinimalChannelService],
  controllers: [MinimalChannelController]
})
export class MinimalChannelModule {}