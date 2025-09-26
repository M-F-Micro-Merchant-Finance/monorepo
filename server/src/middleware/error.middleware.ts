import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { VerificationError, HttpStatusCode } from '../types/verification.types';

export class ErrorMiddleware {
  private static logger = Logger.getInstance();

  public static handleError(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    ErrorMiddleware.logger.error('Unhandled error', error, {
      url: req.url,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (error instanceof VerificationError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString()
      });
    } else if (error.name === 'ValidationError') {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    } else if (error.name === 'SyntaxError') {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Invalid JSON',
        code: 'INVALID_JSON',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  public static handleNotFound(req: Request, res: Response): void {
    ErrorMiddleware.logger.warn('Route not found', {
      url: req.url,
      method: req.method
    });

    res.status(HttpStatusCode.NOT_FOUND).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    });
  }

  public static handleAsyncError(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
