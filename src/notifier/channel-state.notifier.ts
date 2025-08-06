import { Injectable, Logger } from "@nestjs/common"
import { NotifyChannelStateDto } from "src/notifier/dto/notify-channel-state.dto"
import { MessageDispatcherService } from "src/message-dispatcher/message-dispatcher.service"
import { ChannelInfoDto } from '../channel/dto/channel-info.dto'
import { generateDiffEvaluator } from '../commons/utils/evaluation.util'
import { ChannelStateDto } from '../channel/dto/channel-state.dto'
import { channelInfoToChannelState } from './notifier.util'

@Injectable()
export class ChannelStateNotifier {
  private readonly logger = new Logger(ChannelStateNotifier.name)

  private readonly evaluator = generateDiffEvaluator<ChannelStateDto>()

  constructor(
    private readonly messageDispatcherService: MessageDispatcherService,
  ) {}

  notifyDiff = async (originalChannelInfos: ChannelInfoDto[], newChannelInfos: ChannelInfoDto[]) => {
    const er = this.evaluator(
      originalChannelInfos.map(channelInfoToChannelState),
      newChannelInfos.map(channelInfoToChannelState)
    )

    const changedPromises = er.changed
      .map(channelState => ({
        channelId: channelState.channelId,
        state: channelState.state ? 'open' : 'closed',
      }))
      .map(this.notify)

    const addedPromises = er.added
      .map(channelState => ({
        channelId: channelState.channelId,
        state: 'added'
      }))
      .map(this.notify)

    const deletedPromises = er.deleted
      .map(channelState => ({
        channelId: channelState.channelId,
        state: 'deleted'
      }))
      .map(this.notify)

    const numberOfNotifiedChannels = newChannelInfos.length - er.unchanged.length

    await Promise.all([...changedPromises, ...addedPromises, ...deletedPromises])

    this.logger.log(`${numberOfNotifiedChannels}개의 채널 상태 변경을 발신하였습니다.`)

    return numberOfNotifiedChannels !== 0
  }

  notify = async (channelState: NotifyChannelStateDto) => {
    this.messageDispatcherService.notifyChannelStateChange(channelState)
  }
}