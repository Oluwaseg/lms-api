export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: {
    field?: string;
    message: string;
  }[];
  timestamp: string;
}

export class ResponseHandler {
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: PaginationMeta
  ): ApiResponse<T> {
    return {
      statusCode,
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message: string = 'Error occurred',
    statusCode: number = 400,
    errors?: { field?: string; message: string }[]
  ): ApiResponse<null> {
    return {
      statusCode,
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  static validationError(
    errors: { field: string; message: string }[]
  ): ApiResponse<null> {
    return this.error('Validation failed', 400, errors);
  }

  static notFound(message: string = 'Resource not found'): ApiResponse<null> {
    return this.error(message, 404);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiResponse<null> {
    return this.error(message, 401);
  }
}
