import { ImageDto } from './image.dto'

export interface ImageEvaluationResult {
  added: ImageDto[]
  updated: ImageDto[],
  unchanged: ImageDto[],
  deleted: ImageDto[]
}