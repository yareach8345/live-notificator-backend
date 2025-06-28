import { ImageDto } from './image.dto'

export interface ImageChangeCheckResult {
  updated: ImageDto[],
  unchanged: ImageDto[],
  deleted: ImageDto[]
}