import { Injectable } from '@nestjs/common'
import { NotifyBaseService } from '../commons/base/notify-base.service'
import { Subject } from 'rxjs'
import { SseMessageDto } from './dto/sse-message.dto'
import { SseConnectionDto } from './dto/sse-connection.dto'
import { v4 as uuidv4 } from 'uuid';
import { SseConnectionDetail } from './dto/sse-connection-detail.dto'
import { SseMessage } from './type/sse-message.type'

@Injectable()
export class SseService extends NotifyBaseService {
  private readonly clientsMap: Map<string, SseConnectionDto> = new Map()

  addClient(): SseConnectionDto {
    const uuid = uuidv4()
    const client$ = new Subject<SseMessage<SseMessageDto>>

    const connectedDto = {
      sseId: uuid,
      sseClient$: client$,
      connectedAt: new Date()
    }

    this.clientsMap.set(uuid, connectedDto)

    return connectedDto
  }

  removeClient(sseId: string) {
    this.clientsMap.delete(sseId)
  }

  getConnectionDetails(): SseConnectionDetail[] {
    return Array.from(this.clientsMap.values())
      .map(({ sseId, connectedAt }) => ({ sseId, connectedAt }))
  }

  override notify(topic: string, payload: string) {
    this.clientsMap.forEach(({sseClient$}) => {
      sseClient$.next({
        data: { topic, payload },
      })
    })
  }
}