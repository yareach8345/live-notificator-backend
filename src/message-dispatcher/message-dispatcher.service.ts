import { Injectable } from '@nestjs/common'
import { NotifyBaseService } from '../commons/base/notify-base.service'
import { MqttService } from '../mqtt/mqtt.service'
import { SseService } from '../sse/sse.service'

@Injectable()
export class MessageDispatcherService extends NotifyBaseService {
  constructor(
    private readonly mqttService: MqttService,
    private readonly sseService: SseService,
  ) {
    super()
  }

  notify(topic: string, payload: string) {
    this.mqttService.notify(topic, payload)
    this.sseService.notify(topic, payload)
  }
}