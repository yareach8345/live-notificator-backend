import { Controller, Get, Logger, Query, Sse, UseGuards } from "@nestjs/common";
import { SseService } from "./sse.service";
import { Observable } from "rxjs";
import { LoginGuard } from '../auth/auth.guard'

@Controller('sse')
export class SseController {
  private logger: Logger = new Logger(SseController.name);

  constructor(private readonly sseService: SseService) {}

  @Sse('/connect')
  @UseGuards(LoginGuard)
  connectSse() {
    const {
      sseClient$,
      sseId
    } = this.sseService.addClient()

    this.logger.log(`sse 연결 : ${sseId}`)

    return new Observable((subscriber) => {
      sseClient$.subscribe((event) => {
        subscriber.next(event);
      });

      // 연결이 끊기면 실행될 콜백
      return () => {
        this.logger.log(`sse 연결 해재 : ${sseId}`);
        this.sseService.removeClient(sseId)
      };
    });
  }

  @Get('/connections')
  @UseGuards(LoginGuard)
  getConnections() {
    return this.sseService.getConnectionDetails()
  }

  @Get('/test')
  @UseGuards(LoginGuard)
  getSseTest(
    @Query('message') message: string,
    @Query('event') event?: string
  ) {
    this.sseService.notify(
      event ?? "test",
      message
    )

    return {
      message,
      event
    }
  }
}