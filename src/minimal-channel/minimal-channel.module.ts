import { Module } from '@nestjs/common'
import { ChannelModule } from '../channel/channel.module'
import { MinimalChannelController } from './minimal-channel.controller'
import { MinimalChannelService } from './minimal-channel.service'
import { MessageDispatcherModule } from '../message-dispatcher/message-dispatcher.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    ChannelModule,
    MessageDispatcherModule,
    AuthModule,
  ],
  providers: [MinimalChannelService],
  controllers: [MinimalChannelController]
})
export class MinimalChannelModule {}