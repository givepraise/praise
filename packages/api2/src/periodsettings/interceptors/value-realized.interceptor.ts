import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { valueToValueRealized } from '@/settings/utils/value-to-value-realized.util';

@Injectable()
export class ValueRealizedInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data) && data.length > 0) {
          return data.map((periodSetting: any) => ({
            ...periodSetting,
            valueRealized: valueToValueRealized(
              periodSetting.value,
              periodSetting.setting.type,
            ),
            setting: {
              ...periodSetting.setting,
              valueRealized: valueToValueRealized(
                periodSetting.setting.value,
                periodSetting.setting.type,
              ),
            },
          }));
        }

        return {
          ...data,
          valueRealized: valueToValueRealized(data.value, data.setting.type),
          setting: {
            ...data.setting,
            valueRealized: valueToValueRealized(
              data.setting.value,
              data.setting.type,
            ),
          },
        };
      }),
    );
  }
}
