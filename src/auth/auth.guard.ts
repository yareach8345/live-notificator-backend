import { AuthGuard } from "@nestjs/passport";
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { zodParsing } from '../commons/utils/zod.util'
import { UserInfoSchema } from './schemas/userinfo.zod'
import { requireEnvArray } from '../commons/utils/env.util'
import { captureStackTrace } from 'zod/dist/types/v4/core/util'

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleAuthGuard.name);

  async canActivate(context: ExecutionContextHost): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    //로그인 확인
    const loggedIn = request.isAuthenticated();
    if(loggedIn) {
      return true
    }

    //로그인 후 유저정보 확인
    const result = (await super.canActivate(context)) as boolean
    if(!request.user) {
      this.logger.error(`로그인 성공했으나 유저 정보 없음`)
      throw new UnauthorizedException("OAuth 성공했으나 유저 정보는 없음");
    }

    //로그인 처리
    await super.logIn(request);
    this.logger.log(`로그인 : ${request.user.email}`)
    return result
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  private readonly logger = new Logger(LoginGuard.name);
  private readonly allowedEmails = requireEnvArray("ALLOWED_EMAILS")

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const result = request.isAuthenticated()

    if(!result) {
      const response = context.switchToHttp().getResponse();
      response.redirect("/auth/google-login")
      return false
    }

    const userEmail = request.user.email

    if (!this.allowedEmails.includes(userEmail)) {
      this.logger.warn(`인증되지 않은 유저 접속시도: ${userEmail}`)
      return false
    }

    return true
  }
}