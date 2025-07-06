import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from "express-session";
import * as passport from "passport";
import { requireEnvArray } from './commons/utils/env.util';

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

  app.enableCors({
    origin: requireEnvArray('CORS'),
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().then(() => console.log('Server is running at http://localhost:8000'));
