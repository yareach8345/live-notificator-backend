import { GoogleStrategy } from "./google.strategy";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { SessionSerializer } from "./session.serializer";
import { LoginGuard } from './guards/login.guard'

@Module({
  imports: [PassportModule, PassportModule.register({ session: true })],
  providers: [
    GoogleStrategy,
    SessionSerializer,
    LoginGuard
  ],
  controllers: [AuthController],
  exports: [LoginGuard],
})
export class AuthModule {}