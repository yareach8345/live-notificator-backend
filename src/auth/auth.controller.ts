import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express"
import { GoogleAuthGuard, LoginGuard } from "./auth.guard";

@Controller('auth')
export class AuthController {
  @Get('google-login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() _req: Request, @Res() _res: Response) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user

    const loginResultDto = {
      success: true,
      user,
    }

    res.send(loginResultDto)
  }

  @Get('check')
  async checkSession(@Req() req: Request, @Res() res: Response) {
    return res.send({
      sessionId: req.sessionID,
      session: req.session,
      user: req.user,
      isAuthenticated: req.isAuthenticated?.()
    });
  }

  @Get('test')
  @UseGuards(LoginGuard)
  async test(@Req() req: Request, @Res() res: Response) {
    return res.send(req.user)
  }
}