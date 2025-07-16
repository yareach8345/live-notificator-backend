import { HttpException, HttpStatus } from '@nestjs/common'

export class AlreadyExistsException extends HttpException {
  constructor(
    message: string = 'Already Exists'
  ) {
    super(message, HttpStatus.CONFLICT)
  }
}