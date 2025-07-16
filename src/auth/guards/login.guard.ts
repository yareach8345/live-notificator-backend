import { AuthGuard } from "@nestjs/passport";
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { requireEnvArray } from '../../commons/utils/env.util'

@Injectable()
export class LoginGuard implements CanActivate {
  private readonly logger = new Logger(LoginGuard.name);
  private readonly allowedEmails = requireEnvArray("ALLOWED_EMAILS")

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const result = request.isAuthenticated()

    if(!result) {
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