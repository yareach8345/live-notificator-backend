import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginGuard } from './auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(LoginGuard)
  getHello(): string {
    return this.appService.getHello();
  }
}
