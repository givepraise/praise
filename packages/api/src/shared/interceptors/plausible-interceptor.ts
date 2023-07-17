import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { sendPageViewEvent } from '../analytics/plausible/sendEvent';

@Injectable()
export class PlausibleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const userAgent = request.get('user-agent') || '';
    const xForwardedFor = request.get('x-forwarded-for') || '';

    return next.handle().pipe(
      tap(async () => {
        await sendPageViewEvent({
          userAgent: userAgent,
          xForwardedFor: xForwardedFor,
          eventName: request.method,
          url: `api://${request.originalUrl}`,
          props: {
            httpStatusCode: response.statusCode,
          },
        });
      }),
    );
  }
}
