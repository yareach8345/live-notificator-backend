import { Controller, Get, Logger, Query, Sse } from "@nestjs/common";
import { SseService } from "./sse.service";
import { Observable } from "rxjs";

@Controller('sse')
export class SseController {
  private logger: Logger = new Logger(SseController.name);

  constructor(private readonly sseService: SseService) {}

  @Sse()
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
  getConnections() {
    return this.sseService.getConnectionDetails()
  }

  @Get('/test')
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