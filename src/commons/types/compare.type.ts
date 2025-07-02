export type CompareResult = 'new' | 'changed' | 'unchanged'

export type CompareFunction<T> = (original: T, comparison: T) => CompareResult