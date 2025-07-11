import { Controller, Get, Logger, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express"
import { GoogleAuthGuard, LoginGuard } from "./auth.guard";
import { requireEnv } from '../commons/utils/env.util'
import { AuthCheckDto } from './dto/auth-check.dto'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  @Get('google-login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() _req: Request, @Res() _res: Response) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    this.logger.log(`로그인 : ${(req.user as any).email}`)

    res.redirect(requireEnv("FRONTEND_URL"))
  }

  @Get('check')
  async checkSession(@Req() req: Request, @Res() res: Response) {
    const result: AuthCheckDto = {
      isAuthenticated: req.isAuthenticated(),
      user: req.user
    }

    return res.send(result);
  }

  @Get('test')
  @UseGuards(LoginGuard)
  async test(@Req() req: Request, @Res() res: Response) {
    return res.send(req.user)
  }
}