import { RuntimeException } from "@nestjs/core/errors/exceptions";

export class MissingEnvException extends RuntimeException{
  constructor(envName: string){
    super(`환경변수가 선언되어있지 않습니다: ${envName}`)
  }
}