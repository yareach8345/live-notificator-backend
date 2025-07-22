import { youtube_v3 } from '@googleapis/youtube'
import Schema$Channel = youtube_v3.Schema$Channel
import { YouTubeChannelParsingException } from '../commons/exceptions/youtube-channel-parsing.exception'

export const getChannelImageUrl = (channel: Schema$Channel) => {
  const thumbnails = channel.snippet?.thumbnails

  return thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    undefined
}

export const stringFieldToNumber = (stringValue: string | undefined | null) => {
  return stringValue ? parseInt(stringValue, 10) : undefined
}

export function requiredField<T>(fieldValue: T | null | undefined, message?: string): T {
  if(!fieldValue) {
    throw new YouTubeChannelParsingException(message ?? "필수인 필드의 값이 null혹은 undefined입니다.")
  }
  return fieldValue
}