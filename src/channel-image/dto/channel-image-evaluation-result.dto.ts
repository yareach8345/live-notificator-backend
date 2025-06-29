import { ChannelImageDto } from './channel-image.dto'

export interface ChannelImageEvaluationResult {
  added: ChannelImageDto[]
  updated: ChannelImageDto[],
  unchanged: ChannelImageDto[],
  deleted: ChannelImageDto[]
}