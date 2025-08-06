import { Injectable, Logger } from "@nestjs/common"
import { MessageDispatcherService } from "src/message-dispatcher/message-dispatcher.service"
import { ChannelInfoDto } from '../channel/dto/channel-info.dto'
import { generateDiffEvaluator } from '../commons/utils/evaluation.util'
import { projectChannelInfoForCompare } from './notifier.util'
import { ComparableChannelInfoDto } from './dto/comparable-channel-info.dto'
import { ChannelInfoChangeDto } from '../message-dispatcher/dto/channel-info-change.dto'
import { channelIdToString } from '../commons/utils/channel-id.util'
import { compareDataToChangeDto } from '../minimal-channel/minimal-channel.util'
import { getUpdatedFields } from '../commons/utils/diff.util'
import { ChannelId } from "src/commons/types/channel-id.type"

@Injectable()
export class ChannelInfoNotifier {
  private readonly logger = new Logger(ChannelInfoNotifier.name)

  private readonly evaluator = generateDiffEvaluator<ComparableChannelInfoDto>()

  constructor(
    private readonly messageDispatcherService: MessageDispatcherService,
  ) {}

  notifyDiff = async (originalChannelInfos: ChannelInfoDto[], newChannelInfos: ChannelInfoDto[]) => {
    const { changed, previous, unchanged } = this.evaluator(
      originalChannelInfos.map(projectChannelInfoForCompare),
      newChannelInfos.map(projectChannelInfoForCompare)
    )

    const previousMap = new Map<string, ChannelInfoChangeDto>( previous.map(before => [ channelIdToString(before.channelId), compareDataToChangeDto(before) ]) )
    const notifyPromises = changed
      .map(after => ({
        channelId: after.channelId,
        after: compareDataToChangeDto(after),
        before: previousMap.get(channelIdToString(after.channelId))!,
      }))
      .map(({ channelId, before, after}) => ({
        channelId,
        diff: getUpdatedFields(before, after)
      }))
      .filter(({ diff }) => Object.keys(diff).length > 0)
      .map(({ channelId, diff}) => this.notify(channelId, diff))

    await Promise.all(notifyPromises)

    const numberOfNotifiedChannels = newChannelInfos.length - unchanged.length

    this.logger.log(`${numberOfNotifiedChannels}개의 채널 상세 정보 변경을 발신하였습니다.`)

    return numberOfNotifiedChannels !== 0
  }

  notify = async (
    channelId: ChannelId,
    diff: Partial<ChannelInfoChangeDto>
  ) => {
    this.messageDispatcherService.notifyChannelInfoChange(channelId, diff)
  }
}