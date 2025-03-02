import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponseDto } from '../dto/base-response.dto';

// Define interface for the expected response data structure
interface ResponseData {
  statusCode?: number;
  status?: boolean;
  message?: string;
  result?: unknown;
}

@Injectable()
export class CustomBaseResponseInterceptor<T>
  implements NestInterceptor<T, BaseResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponseDto<T>> {
    return next.handle().pipe(
      map((data: ResponseData) => {
        const response = context.switchToHttp().getResponse();

        // Type assertion untuk response
        const typedResponse = response as {
          statusCode: number;
          status: (code: number) => void;
        };

        // Menggunakan status_code dari data jika ada, jika tidak gunakan statusCode dari response
        const statusCode = data.statusCode || typedResponse.statusCode;

        // Mengubah status code response jika data.status_code ada
        if (data.statusCode) {
          typedResponse.status(data.statusCode);
        }

        return new BaseResponseDto<T>({
          statusCode,
          status: data.status !== undefined ? data.status : true,
          message: data.message || 'Success',
          data: data.result as T,
        });
      }),
    );
  }
}
