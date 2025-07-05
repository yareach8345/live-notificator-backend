import { Injectable, Logger } from '@nestjs/common'
import mqtt, { MqttClient } from 'mqtt'
import { ChannelStateDto } from '../channel/dto/channel-state.dto'
import { ChannelInfoChangeDto } from './dto/channel-info-change.dto'
import { ca } from 'zod/dist/types/v4/locales'

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
    this.logger.log(`채널 상태 변경 mqtt publish 발생 channelId: ${channelState.channelId}`)
    this.mqttClient.publish(
      `channel/${channelState.channelId}/state`,
      channelState.state ? 'open' : 'closed',
    )
  }

  notifyChannelInfoChange(channelId: string, channelInfoChangeDto: Partial<ChannelInfoChangeDto>) {
    this.logger.log(`채널 정보 변경 mqtt publish 발생 channelId : ${channelId}`)
    this.mqttClient.publish(
      `channel/${channelId}/info-changed`,
      JSON.stringify(channelInfoChangeDto),
    )
    // Object.entries(channelInfoChangeDto).forEach(([key, value]) => {
    //   this.mqttClient.publish(
    //     `channel/${channelId}/info-changed/${key}`,
    //     `${value}`
    //   )
    // })
  }
}