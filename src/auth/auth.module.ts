import { GoogleStrategy } from "./google.strategy";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { SessionSerializer } from "./session.serializer";

@Module({
  imports: [PassportModule, PassportModule.register({ session: true })],
  providers: [GoogleStrategy, SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}