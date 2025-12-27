import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces';
import { Response } from 'express';

interface InterceptorResponse<T> {
  data?: T;
  message?: string;
}

function isInterceptorResponse<T>(
  result: InterceptorResponse<T> | T,
): result is InterceptorResponse<T> {
  return typeof result === 'object' && result !== null && 'data' in result;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((result: InterceptorResponse<T> | T): ApiResponse<T> => {
        // Si el servicio devuelve { data, message }
        if (isInterceptorResponse(result)) {
          return {
            success: response.statusCode < 400,
            status: response.statusCode,
            message: result.message ?? 'Operación exitosa',
            data: result.data,
          };
        }

        // Respuesta normal
        return {
          success: response.statusCode < 400,
          status: response.statusCode,
          message: 'Operación exitosa',
          data: result,
        };
      }),
    );
  }
}
