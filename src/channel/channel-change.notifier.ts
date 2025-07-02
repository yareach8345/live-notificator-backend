import { ChannelDetailDto } from './dto/channel-detail.dto'
import { EvaluationResultDto } from '../commons/dto/evaluation-result.dto'
import { generateDiffEvaluator } from '../commons/utils/evaluation.util'

export type ChannelDetailTransformer<R> = (channelDetailDto: ChannelDetailDto) => R

export type OnUpdateCallback<T> = (data: EvaluationResultDto<T>, allData: T[]) => void

export interface ChannelChangeObserver<R extends Record<'channelId', string>>  {
  subscribe: (callback: OnUpdateCallback<R>) => void
}

export interface ChannelChangeEmitter {
  emit: (newChannelDetail: ChannelDetailDto[], oldChannelDetail: ChannelDetailDto[]) => void
}

export class ChannelChangeNotifier<R extends Record<'channelId', string>> implements ChannelChangeObserver<R>, ChannelChangeEmitter {
  private readonly callbacks: OnUpdateCallback<R>[] = []
  
  private readonly evaluate = generateDiffEvaluator<R, 'channelId'>('channelId')

  constructor(private readonly transformerFromChannelDetailToR: ChannelDetailTransformer<R>) {}

  subscribe = (callback: OnUpdateCallback<R>) => {
    this.callbacks.push(callback)
  }

  emit = (newChannelDetail: ChannelDetailDto[], oldChannelDetail: ChannelDetailDto[]) => {
    const transformedNewChannel = newChannelDetail.map(this.transformerFromChannelDetailToR)
    const transformedOldChannel = oldChannelDetail.map(this.transformerFromChannelDetailToR)

    const evaluationResult = this.evaluate(transformedOldChannel, transformedNewChannel)

    if(evaluationResult.unchanged.length === newChannelDetail.length) {
      return
    }

    this.callbacks.forEach(callback => callback(evaluationResult, transformedNewChannel))
  }
}

export function createChannelChangeNotifier<R extends Record<'channelId', string>>(
  transformerFromChannelDetailToR: ChannelDetailTransformer<R>
): [ChannelChangeEmitter, ChannelChangeObserver<R>] {
  const notifier = new ChannelChangeNotifier<R>(transformerFromChannelDetailToR)
  return [
    notifier as ChannelChangeEmitter,
    notifier as ChannelChangeObserver<R>
  ]
}