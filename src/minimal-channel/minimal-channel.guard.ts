import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { LoginGuard } from '../auth/guards/login.guard'

@Injectable()
export class MinimalChannelGuard implements CanActivate {
  private readonly guards: CanActivate[] = []

  constructor(
    readonly loginGuard: LoginGuard
  ) {
    this.guards.push(loginGuard)
  }

  async canActivate(context: ExecutionContext) {
    for(const guard of this.guards) {
      const result = await guard.canActivate(context)

      if(result) {
        return true
      }
    }
    return false
  }
}