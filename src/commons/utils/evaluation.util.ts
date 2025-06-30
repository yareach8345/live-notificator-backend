import { EvaluationResultDto } from '../dto/evaluation-result.dto'

export type CompareResult = 'updated' | 'unchanged' | 'new'

export const evaluateDiff = <T extends Record<K, any>, K extends keyof T>(indexField: K, compare: (original: T | undefined, comparison: T) => CompareResult) => (originalItems: T[] | Map<T[K], T>, comparisonItems: T[]): EvaluationResultDto<T> => {
  const added: T[] = []
  const updated: T[] = []
  const unchanged: T[] = []
  const deleted: T[] = []

  const originalDataMap = Array.isArray(originalItems)
    ? new Map( originalItems.map(data => [data[indexField], data]) )
    : originalItems

  comparisonItems.forEach(comparisonItem=> {
    const originalItem = originalDataMap.get(comparisonItem[indexField])
    originalDataMap.delete(comparisonItem[indexField])

    const compareResult = compare(originalItem, comparisonItem)

    if(compareResult=== 'new') {
      added.push(comparisonItem)
    } else if (compareResult=== 'updated') {
      updated.push(comparisonItem)
    } else {
      unchanged.push(comparisonItem)
    }
  })

  originalDataMap.forEach(remainingItem => deleted.push(remainingItem))

  return {
    added,
    updated,
    unchanged,
    deleted
  }
}