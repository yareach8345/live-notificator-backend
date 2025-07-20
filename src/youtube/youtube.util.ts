import { youtube_v3 } from '@googleapis/youtube'
import Schema$Channel = youtube_v3.Schema$Channel

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