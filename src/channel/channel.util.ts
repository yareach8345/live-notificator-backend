import { ChannelDetailDto, LiveCloseDto, LiveOpenDto } from './dto/channel-info.dto'

type MinimalChannelInfo = { liveState: Pick<LiveCloseDto, 'isOpen'> | Pick<LiveOpenDto, 'isOpen' | 'concurrentUserCount'>, detail: Pick<ChannelDetailDto, 'priority' | 'followerCount'> }

/*
  우선순위 기준
  1. 방송 상태가 다른 경우 => 켜진 것이 우선
  2. 방송 상태가 같은 경우 => 우선순위 높은 것이 우선
  3. 방송이 둘 다 켜져있고 우선순위가 같은 경우 => 시청자 수가 우선
  4. 방송이 둘 다 꺼져있고 우선순위가 같은 경우 => 팔로워 수가 우선
*/
export function sortChannels<T extends MinimalChannelInfo>(
  channels: T[]
): T[] {
  return channels.toSorted((c1, c2) => {
    if(c1.liveState.isOpen !== c2.liveState.isOpen) {
      // 1. 방송 상태가 다른 경우 켜진 것이 우선
      return c1.liveState.isOpen ? -1 : 1
    }

    const priorityDiff = (c1.detail.priority ?? 256) - (c2.detail.priority ?? 256)
    if(priorityDiff !== 0) {
      // 2. 방송 상태가 같은 경우 우선순위 높은 것이 우선
      return priorityDiff
    }

    if(c1.liveState.isOpen && c2.liveState.isOpen) {
      // 3. 방송이 둘 다 켜져있고 우선순위가 같으면 시청자수로 비교
      return c2.liveState.concurrentUserCount - c1.liveState.concurrentUserCount
    }

    // 4. 방송이 둘 다 꺼져있고 우선순위가 같으면 팔로워 수 비교
    return c2.detail.followerCount - c1.detail.followerCount
  })
}