import { Injectable, Logger } from '@nestjs/common'
import mqtt, { MqttClient } from 'mqtt'
import { NotifyBaseService } from '../commons/base/notify-base.service'
import { requireEnv } from '../commons/utils/env.util'

@Injectable()
export class MqttService extends NotifyBaseService {
  private readonly mqttClient: MqttClient
  private readonly baseTopic: string
  private logger: Logger = new Logger(MqttService.name)

  constructor() {
    super()

    const baseTopic = process.env.MQTT_BASE_TOPIC
    this.baseTopic = baseTopic !== undefined ? baseTopic + '/' : ""

    this.mqttClient = mqtt.connect(requireEnv('MQTT_URL'))
    this.mqttClient.on('connect', () => {
      this.logger.log('MQTT 연결 성공')
    })
  }

  notify(topic: string, payload: string) {
    this.mqttClient.publish(
      `${this.baseTopic}${topic}`,
      payload
    )
  }
}