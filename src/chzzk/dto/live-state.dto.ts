export interface LiveOpenDto {
  liveState: 'open',
  isOpen: true,
  liveTitle: string,
  concurrentUserCount: number,
  tags: string[],
  category: string,
}

export interface LiveCloseDto {
  liveState: 'closed',
  isOpen: false,
}

export interface LiveNotFoundDto {
  liveState: 'notFound',
  isOpen: false,
}

export type LiveStateDto = LiveOpenDto | LiveCloseDto | LiveNotFoundDto