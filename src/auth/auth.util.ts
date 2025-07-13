import { Request } from "express"
import { UserInfoSchema } from './schemas/userinfo.zod'

export const getUserEmail = (req: Request) => {
  const user = UserInfoSchema.safeParse(req.user)

  if(user.success) {
    return user.data.email
  } else {
    return null
  }
}

export const sessionDestroy = (req: Request) => new Promise<void>((res, rej) => {
  req.session.destroy((err) => {
    if(err) {
      rej(err)
    }
    res()
  })
})