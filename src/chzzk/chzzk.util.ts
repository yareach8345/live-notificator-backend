import { LiveStatus } from 'chzzk'
import { ChzzkLiveStateDto } from './dto/chzzk-live-state.dto'

export function getLiveStateDtoFromLiveStatus(liveStatus: LiveStatus | null): ChzzkLiveStateDto {
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