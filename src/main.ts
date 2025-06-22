import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from "express-session";
import * as passport from "passport";
import { ChzzkAdapter } from './clients/chzzk.client'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
      session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 1000
        },
      })
  )
  app.use(passport.initialize());
  app.use(passport.session());

  const chzzkClient = new ChzzkAdapter()
  const chats = chzzkClient.getChzzkChats(['85c8393903d36e694eee9c43e783beda', 'c0d9723cbb75dc223c6aa8a9d4f56002'])
  chats.forEach(chat => {
    chat.on('connect', () => {
      console.log('wow')
    })
    chat.on('chat', c => {
      console.log(`[${chat.chatChannelId}] ${c.profile.nickname}: ${c.message}`)
    })
    chat.on('reconnect', c => {
      console.log('reconnected', c)
    })
    chat.on('notice', notice => {
      console.log('notice', notice)
    })
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().then(() => console.log('Server is running at http://localhost:3000'));
