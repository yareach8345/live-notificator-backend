import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { requireEnv } from './commons/utils/env.util'
import { ChannelEntity } from './channel/channel.entity'
import { ChannelModule } from './channel/channel.module'
import { ChzzkModule } from './chzzk/chzzk.module'
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module'
import { join } from 'path'
import { ChannelImageEntity } from './channel-image/channel-image.entity'
import { ChannelImageModule } from './channel-image/channel-image.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: requireEnv('DB_HOST'),
      port: parseInt(requireEnv('DB_PORT')),
      username: requireEnv('DB_USERNAME'),
      password: requireEnv('DB_PASSWORD'),
      database: requireEnv('DB_DATABASE'),
      entities: [ChannelEntity, ChannelImageEntity],
      logging: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    AuthModule,
    ChannelModule,
    ChzzkModule,
    ChannelImageModule
  ],
  controllers: [ AppController ],
  providers: [AppService],
})
export class AppModule {}
