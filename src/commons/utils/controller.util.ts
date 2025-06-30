import { Pageable } from '../dto/page.dto'
import { ParsedQs } from 'qs'

export function getPageable(query: ParsedQs): Pageable | undefined {
  if (query.page) {
    return {
      page: Number(query.page),
      pageSize: Number(query.pageSize || 10),
    }
  } else {
    return undefined
  }
}