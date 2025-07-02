import { EvaluationResultDto } from '../dto/evaluation-result.dto'
import { isEqual } from 'lodash'

export type IsChangedFunction<T> = (original: T, comparison: T) => boolean

export const generateEvaluator = <T extends Record<K, any>, K extends keyof T>(indexField: K, isChanged: IsChangedFunction<T> = (item1, item2) => !isEqual(item1, item2)) => (originalItems: T[] | Map<T[K], T>, comparisonItems: T[]): EvaluationResultDto<T> => {
  const added: T[] = []
  const changed: T[] = []
  const unchanged: T[] = []
  const deleted: T[] = []

  const originalDataMap = Array.isArray(originalItems)
    ? new Map( originalItems.map(data => [data[indexField], data]) )
    : originalItems

  comparisonItems.forEach(comparisonItem=> {
    const originalItem = originalDataMap.get(comparisonItem[indexField])
    originalDataMap.delete(comparisonItem[indexField])

    if(originalItem === undefined) {
      added.push(comparisonItem)
      return
    }

    if(isChanged(originalItem, comparisonItem)) {
      added.push(comparisonItem)
    } else {
      unchanged.push(comparisonItem)
    }
  })

  originalDataMap.forEach(remainingItem => deleted.push(remainingItem))

  return {
    added,
    changed,
    unchanged,
    deleted
  }
}