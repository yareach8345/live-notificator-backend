export interface EvaluationResultDto<T> {
  added: T[]
  changed: T[]
  previous: T[]
  unchanged: T[],
  deleted: T[]
}