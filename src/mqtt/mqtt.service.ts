import { Injectable, Logger } from '@nestjs/common'
import mqtt, { MqttClient } from 'mqtt'
import { ChannelStateDto } from '../channel/dto/channel-state.dto'
import { ChannelInfoChangeDto } from './dto/channel-info-change.dto'
import { UpdateNotifyDto } from './dto/update-notify.dto'
import { dateToString } from '../commons/utils/date.util'

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
  }

  notifyChannelInfoUpdate(updateDto: UpdateNotifyDto) {
    const datetime = dateToString(updateDto.date)
    this.logger.log(`채널 업데이터 notify mqtt publish 발생 : ${datetime}`)
    this.mqttClient.publish(
      'updated-at',
      datetime
    )
  }
}