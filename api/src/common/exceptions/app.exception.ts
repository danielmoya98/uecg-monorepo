import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public readonly errorCode: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details: any = null,
  ) {
    super(
      {
        message,
        code: errorCode,
        details,
      },
      status,
    );
  }
}
