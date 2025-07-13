import { Injectable, Logger } from '@nestjs/common'
import { requireEnv, requireEnvArray } from '../commons/utils/env.util'
import CoolsmsMessageService, { Message } from 'coolsms-node-sdk'
import { SendChannelStateWithSmsDto } from './dto/send-channel-state-with-sms.dto'

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name)
  private readonly enable: boolean
  private readonly from: string
  private readonly to: string[]

  private readonly messageService = new CoolsmsMessageService(
    requireEnv("SMS_API_KEY"),
    requireEnv("SMS_SECRET_KEY"),
  )

  constructor () {
    const enableEnv = requireEnv("SMS_ENABLE")
    if(['TRUE', 'FALSE', 'true', 'false'].indexOf(enableEnv) === -1) {
      throw new Error("SMS_ENABLE 환경변수가 형식에 맞지 않습니다.")
    }
    this.enable = enableEnv.toUpperCase() === 'TRUE'
    this.from = this.enable ? requireEnv("SMS_FROM") : ''
    this.to = this.enable ? requireEnvArray("SMS_TO") : []

    this.sendSms("[ 시작 알림 ] Chzzk Notification 서비스 시작")
      .then(() => {
        if(this.enable) {
          this.logger.log("SMS 서비스 시작")
        } else {
          this.logger.log("SMS 서비스 비활성화")
        }
      })
  }

  async sendChannelStateWithSms(sendChannelStateDto: SendChannelStateWithSmsDto) {
    const channelStateText = sendChannelStateDto.state ? "on" : "off"
    const message = `[ 방송 알림 ] ${sendChannelStateDto.displayName} 방송 ${channelStateText}`

    await this.sendSms(message)
  }

  async sendSms(text: string) {
    if(!this.enable) {
      return
    }

    const messages: Message[] = this.to.map(destinationPhoneNumber => ({
      to: destinationPhoneNumber ,
      from: this.from,
      text: text,
      type: 'SMS',
      autoTypeDetect: false,
    }))

    this.logger.log(`sendSms : ${text}`)
    await this.messageService.sendMany(messages)
  }

  isEnable() {
    return this.enable
  }
}