import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Profile, Strategy } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
import { UserInfoSchema, type UserInfo } from "src/auth/schemas/userinfo.zod";
import { zodParsing } from '../commons/utils/zod.util'
import { requireEnv, requireEnvArray } from '../commons/utils/env.util'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);
  private readonly allowedEmails = requireEnvArray("ALLOWED_EMAILS")

  constructor() {
    super({
      clientID: requireEnv("GOOGLE_OAUTH2_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_OAUTH2_CLIENT_SECRET"),
      callbackURL: requireEnv("GOOGLE_OAUTH2_CALLBACK_URL"),
      scope: ['email', 'profile'],
    })
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<UserInfo> {
    const { emails, id, displayName, provider } = profile
    const email = emails?.[0]?.value

    if (!this.allowedEmails.includes(email!)) {
      this.logger.warn(`인증되지 않은 유저 접속시도: ${email}`)
      throw new UnauthorizedException(`${email}은 인증되지 않은 사용자입니다.`)
    }

    return zodParsing({
      email,
      id,
      displayName,
      provider,
    }, UserInfoSchema)
  }

}