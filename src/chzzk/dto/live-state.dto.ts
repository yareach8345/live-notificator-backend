export interface LiveOpenDto {
  state: 'open',
  isOpen: true,
  liveTitle: string,
  concurrentUserCount: number,
  tags: string[],
  category: string,
}

export interface LiveCloseDto {
  state: 'closed',
  isOpen: false,
}

export interface LiveNotFoundDto {
  state: 'notFound',
  isOpen: false,
}

export type LiveStateDto = LiveOpenDto | LiveCloseDto | LiveNotFoundDto