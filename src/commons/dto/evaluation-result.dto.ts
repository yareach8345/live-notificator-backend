export interface EvaluationResultDto<T> {
  added: T[]
  updated: T[],
  unchanged: T[],
  deleted: T[]
}