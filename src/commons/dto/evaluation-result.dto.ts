export interface EvaluationResultDto<T> {
  added: T[]
  changed: T[],
  unchanged: T[],
  deleted: T[]
}