import { LiveStatus } from 'chzzk'
import { LiveStateDto } from './dto/live-state.dto'

export function getLiveStateDtoFromLiveStatus(liveStatus: LiveStatus | null): LiveStateDto {
  if(liveStatus === null) {
    return {
      state: 'notFound',
      isOpen: false,
    }
  }

  if(liveStatus.status === "OPEN") {
    return {
      state: 'open',
      isOpen: true,
      liveTitle: liveStatus.liveTitle,
      concurrentUserCount: liveStatus.concurrentUserCount,
      tags: liveStatus.tags,
      category: liveStatus.liveCategory ?? ""
    }
  } else {
    return {
      state: 'closed',
      isOpen: false,
    }
  }
}