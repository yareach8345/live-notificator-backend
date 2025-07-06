import { Injectable } from '@nestjs/common'
import { NotifyBaseService } from '../commons/base/notify-base.service'

@Injectable()
export class SseService extends NotifyBaseService {
  override notify(topic: string, payload: string) {
    console.log(topic, payload)
  }
}