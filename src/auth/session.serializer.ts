import { Injectable, Logger } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { UserInfoSchema } from '../schemas/userinfo.zod'
import { zodParsing } from '../utils/zod.util'

@Injectable()
export class SessionSerializer extends PassportSerializer{
  constructor() {
    super();
  }

  serializeUser(user: any, done: Function) {
    done(null, zodParsing(user, UserInfoSchema));
  }

  deserializeUser(payload: any, done: Function) {
    done(null, zodParsing(payload, UserInfoSchema));
  }
}