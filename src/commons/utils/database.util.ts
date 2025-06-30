import { Pageable } from "../dto/page.dto";

export const calcPagination = (pageable: Pageable | undefined) => {
  if(pageable !== undefined) {
    const { page = 1, pageSize = 10 } = pageable
    return { skip: (page - 1) * pageSize, take: pageSize }
  } else {
    return undefined
  }
}