import { ChannelInfoDto } from './dto/channel-info.dto'
import { EvaluationResultDto } from '../commons/dto/evaluation-result.dto'
import { generateDiffEvaluator } from '../commons/utils/evaluation.util'

export type ChannelInfoTransformer<R> = (channelInfoDto: ChannelInfoDto) => R

export type OnUpdateCallback<T> = (data: EvaluationResultDto<T>) => void

export interface ChannelChangeObserver<R extends Record<'channelId', string>>  {
  subscribe: (callback: OnUpdateCallback<R>) => void
}

export interface ChannelChangeEmitter {
  emit: (newChannelInfo: ChannelInfoDto[], oldChannelInfo: ChannelInfoDto[]) => void
}

export class ChannelChangeNotifier<R extends Record<'channelId', string>> implements ChannelChangeObserver<R>, ChannelChangeEmitter {
  private readonly callbacks: OnUpdateCallback<R>[] = []
  
  private readonly evaluate = generateDiffEvaluator<R, 'channelId'>('channelId')

  constructor(private readonly transformerFromChannelInfoToR: ChannelInfoTransformer<R>) {}

  subscribe = (callback: OnUpdateCallback<R>) => {
    this.callbacks.push(callback)
  }

  emit = (newChannelInfo: ChannelInfoDto[], oldChannelInfo: ChannelInfoDto[]) => {
    const transformedNewChannel = newChannelInfo.map(this.transformerFromChannelInfoToR)
    const transformedOldChannel = oldChannelInfo.map(this.transformerFromChannelInfoToR)

    const evaluationResult = this.evaluate(transformedOldChannel, transformedNewChannel)

    const numberOfUnchangedItems = evaluationResult.unchanged.length
    if( numberOfUnchangedItems === oldChannelInfo.length && numberOfUnchangedItems === newChannelInfo.length ) {
      return
    }

    this.callbacks.forEach(callback => callback(evaluationResult))
  }
}

export function createChannelChangeNotifier<R extends Record<'channelId', string>>(
  transformerFromChannelInfoToR: ChannelInfoTransformer<R>
): [ChannelChangeEmitter, ChannelChangeObserver<R>] {
  const notifier = new ChannelChangeNotifier<R>(transformerFromChannelInfoToR)
  return [
    notifier as ChannelChangeEmitter,
    notifier as ChannelChangeObserver<R>
  ]
}