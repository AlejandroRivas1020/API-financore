import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GlobalErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // handle errors of type HttpException

        if (error instanceof HttpException) {
          return throwError(
            () =>
              new HttpException(
                {
                  status: error.getStatus(),
                  name: error.name,
                  message: error.message || error.getResponse(),
                },
                error.getStatus(),
              ),
          );
        }

        // handle errors of type BadRequestException
        if (error instanceof BadRequestException) {
          const response: any = error.getResponse();
          return throwError(
            () =>
              new HttpException(
                {
                  status: HttpStatus.BAD_REQUEST,
                  name: 'ValidationError',
                  message: response.message || 'Validation failed',
                },
                HttpStatus.BAD_REQUEST,
              ),
          );
        }

        // handle other errors
        return throwError(
          () =>
            new HttpException(
              {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                name: 'InternalServerError',
                message: error.message || 'An unexpected error occurred',
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}
