import { GoogleStrategy } from "./google.strategy";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { SessionSerializer } from "./session.serializer";
import { LoginGuard } from './guards/login.guard'
import { DeviceModule } from '../device/device.module'
import { HeaderAuthGuard } from './guards/header-auth-guard.service'
import { HeaderOrLoginAuthGuard } from './guards/header-or-login-auth.guard'

@Module({
  imports: [
    PassportModule,
    PassportModule.register({ session: true }),
    DeviceModule
  ],
  providers: [
    GoogleStrategy,
    SessionSerializer,
    LoginGuard,
    HeaderAuthGuard,
    HeaderOrLoginAuthGuard
  ],
  controllers: [AuthController],
  exports: [LoginGuard, HeaderAuthGuard, HeaderOrLoginAuthGuard],
})
export class AuthModule {}