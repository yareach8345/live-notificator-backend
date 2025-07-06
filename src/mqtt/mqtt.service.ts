import { Injectable, Logger } from '@nestjs/common'
import mqtt, { MqttClient } from 'mqtt'
import { NotifyBaseService } from '../commons/base/notify-base.service'

@Injectable()
export class MqttService extends NotifyBaseService {
  private readonly mqttClient: MqttClient
  private logger: Logger = new Logger(MqttService.name)

  constructor() {
    super()
    this.mqttClient = mqtt.connect('mqtt://localhost')
    this.mqttClient.on('connect', () => {
      this.logger.log('MQTT 연결 성공')
    })
  }

  notify(topic: string, payload: string) {
    this.mqttClient.publish(topic, payload)
  }
}