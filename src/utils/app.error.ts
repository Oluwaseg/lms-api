export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public field?: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, field?: string) {
    return new AppError(message, 400, field);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message: string = 'Not found') {
    return new AppError(message, 404);
  }

  static internal(message: string = 'Internal server error') {
    return new AppError(message, 500);
  }
}
