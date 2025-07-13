import { Controller, Get, Logger, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express"
import { GoogleAuthGuard, LoginGuard } from "./auth.guard";
import { requireEnv, requireEnvArray } from '../commons/utils/env.util'
import { AuthCheckDto } from './dto/auth-check.dto'
import { getUserEmail, sessionDestroy } from './auth.util'

@Controller('auth')
export class AuthController {
  private readonly allowedEmails = requireEnvArray("ALLOWED_EMAILS")
  private readonly logger = new Logger(AuthController.name);

  @Get('google-login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() _req: Request, @Res() _res: Response) {}

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const email = getUserEmail(req)

    try {
      await sessionDestroy(req)
      this.logger.log(`로그아웃 : ${email}`)
      res.status(200).send()
    } catch (error) {
      this.logger.error('세션 삭제 에러발생:', error)
      return res.status(500).send('세션 삭제중 에러발생')
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    this.logger.log(`로그인 : ${(req.user as any).email}`)

    res.redirect(requireEnv("FRONTEND_URL"))
  }

  @Get('check')
  async checkSession(@Req() req: Request, @Res() res: Response) {
    const isAuthenticated = req.isAuthenticated()

    const email = getUserEmail(req)
    const isValidUser = email ? this.allowedEmails.includes(email) : false

    const result: AuthCheckDto = {
      isAuthenticated,
      email,
      isValidUser
    }

    return res.send(result);
  }

  @Get('login-info')
  @UseGuards(LoginGuard)
  async loginInfo(@Req() req: Request, @Res() res: Response) {
    return res.send(req.user)
  }

  @Get('test')
  @UseGuards(LoginGuard)
  async test(@Req() req: Request, @Res() res: Response) {
    return res.send(req.user)
  }
}