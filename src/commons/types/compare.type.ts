export type CompareResult = 'new' | 'updated' | 'unchanged'

export type CompareFunction<T> = (original: T, comparison: T) => CompareResult