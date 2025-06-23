import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Profile, Strategy } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
import { getAllowedEmails, getGoogleOAuth2Info } from "src/commons/constants/authinfo.const";
import { UserInfoSchema, type UserInfo } from "src/auth/schemas/userinfo.zod";
import { zodParsing } from '../commons/utils/zod.util'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor() {
    super(getGoogleOAuth2Info())
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<UserInfo> {
    const { emails, id, displayName, provider } = profile
    const email = emails?.[0]?.value

    if (!getAllowedEmails().includes(email!)) {
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