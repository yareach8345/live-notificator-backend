import { ZodObject, ZodRawShape } from "zod";
import { Logger } from '@nestjs/common'

export function zodParsing<R extends ZodRawShape>(obj: any, schema: ZodObject<R>) {
  const parsingResult = schema.safeParse(obj)
  if(!parsingResult.success){
    const logger = new Logger(ZodObject.name)
    logger.error(`${ZodObject} 파싱 실패 : `, parsingResult.error)
    throw parsingResult.error
  }
  return parsingResult.data
}