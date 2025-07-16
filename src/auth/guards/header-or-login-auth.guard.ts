import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { LoginGuard } from './login.guard'
import { HeaderAuthGuard } from './header-auth-guard.service'

@Injectable()
export class HeaderOrLoginAuthGuard implements CanActivate {
  private readonly guards: CanActivate[] = []

  constructor(
    readonly headerAuthGuard: HeaderAuthGuard,
    readonly loginGuard: LoginGuard
  ) {
    this.guards.push(headerAuthGuard, loginGuard)
  }

  async canActivate(context: ExecutionContext) {
    for(const guard of this.guards) {
      try {
        const result = await guard.canActivate(context)

        if(result) {
          return true
        }
      } catch (e) {
        if(!(e instanceof UnauthorizedException)) {
          throw e
        }
      }
    }
    return false
  }
}