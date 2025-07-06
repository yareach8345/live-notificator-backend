import { Subject } from 'rxjs'
import { SseMessageDto } from './sse-message.dto'
import { SseMessage } from '../type/sse-message.type'

export interface SseConnectionDto {
  sseId: string
  sseClient$: Subject<SseMessage<SseMessageDto>>
  connectedAt: Date
}