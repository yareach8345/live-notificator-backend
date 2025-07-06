import { Injectable, Logger } from '@nestjs/common'
import mqtt, { MqttClient } from 'mqtt'
import { NotifyBaseService } from '../commons/base/notify-base.service'
import { MqttService } from '../mqtt/mqtt.service'

@Injectable()
export class MessageDispatcherService extends NotifyBaseService {
  constructor(private readonly mqttService: MqttService) {
    super()
  }

  notify(topic: string, payload: string) {
    this.mqttService.notify(topic, payload)
  }
}