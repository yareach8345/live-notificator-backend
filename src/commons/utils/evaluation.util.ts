import { EvaluationResultDto } from '../dto/evaluation-result.dto'
import { isEqual } from 'lodash'
import { ChannelId } from '../types/channel-id.type'
import { calcHashMapKey } from './channel-id.util'

export type IsChangedFunction<T> = (original: T, comparison: T) => boolean

export const generateDiffEvaluator = <T extends Record<'channelId', ChannelId>>(isChanged: IsChangedFunction<T> = (item1, item2) => !isEqual(item1, item2)) => (originalItems: T[], comparisonItems: T[]): EvaluationResultDto<T> => {
  const added: T[] = []
  const previous: T[] = []
  const changed: T[] = []
  const unchanged: T[] = []
  const deleted: T[] = []

  const originalDataMap = new Map( originalItems.map(data => [calcHashMapKey(data), data]) )

  comparisonItems.forEach(comparisonItem=> {
    const originalItem = originalDataMap.get(calcHashMapKey(comparisonItem))
    originalDataMap.delete(calcHashMapKey(comparisonItem))

    if(originalItem === undefined) {
      added.push(comparisonItem)
      return
    }

    if(isChanged(originalItem, comparisonItem)) {
      changed.push(comparisonItem)
      previous.push(originalItem)
    } else {
      unchanged.push(comparisonItem)
    }
  })

  originalDataMap.forEach(remainingItem => deleted.push(remainingItem))

  return {
    added,
    changed,
    previous,
    unchanged,
    deleted
  }
}