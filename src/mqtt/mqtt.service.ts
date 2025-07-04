import { Injectable, Logger } from '@nestjs/common'
import mqtt, { MqttClient } from 'mqtt'
import { ChannelStateDto } from '../channel/dto/channel-state.dto'

@Injectable()
export class MqttService {
  private readonly mqttClient: MqttClient

  private logger: Logger = new Logger(MqttService.name)

  constructor() {
    this.mqttClient = mqtt.connect('mqtt://localhost', {
      username: 'helloworld',
    })
    this.mqttClient.on('connect', () => {
      this.logger.log('MQTT 연결 성공')
    })
  }

  notifyChannelStateChange(channelState: ChannelStateDto) {
    this.logger.log("mqtt publish 발생")
    this.mqttClient.publish(
      `channel/${channelState.channelId}/state`,
      `${channelState.state}`
    )
  }
}