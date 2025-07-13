import { Request } from "express"

export const getUserEmail = (req: Request) => req.user ? (req.user as any).email as string : null

export const sessionDestroy = (req: Request) => new Promise<void>((res, rej) => {
  req.session.destroy((err) => {
    if(err) {
      rej(err)
    }
    res()
  })
})