import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Logger } from '../utils/logger';
import { VerificationError, VerificationErrorCode, HttpStatusCode } from '../types/verification.types';

export class ValidationMiddleware {
  private static logger = Logger.getInstance();

  // Validation schemas
  private static verificationRequestSchema = Joi.object({
    proof: Joi.string().required().messages({
      'string.empty': 'Proof is required',
      'any.required': 'Proof is required'
    }),
    publicSignals: Joi.array().items(Joi.string()).required().min(1).messages({
      'array.empty': 'Public signals are required',
      'array.min': 'At least one public signal is required',
      'any.required': 'Public signals are required'
    }),
    attestationId: Joi.number().integer().valid(1, 2, 3).required().messages({
      'number.base': 'Attestation ID must be a number',
      'number.integer': 'Attestation ID must be an integer',
      'any.only': 'Attestation ID must be 1 (Passport), 2 (EU ID Card), or 3 (Aadhaar)',
      'any.required': 'Attestation ID is required'
    }),
    userContextData: Joi.string().pattern(/^0x[a-fA-F0-9]+$/).required().messages({
      'string.empty': 'User context data is required',
      'string.pattern.base': 'User context data must be a valid hex string',
      'any.required': 'User context data is required'
    }),
    merchantAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required().messages({
      'string.empty': 'Merchant address is required',
      'string.pattern.base': 'Merchant address must be a valid Ethereum address',
      'any.required': 'Merchant address is required'
    })
  });

  private static merchantAddressSchema = Joi.object({
    merchantAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required().messages({
      'string.empty': 'Merchant address is required',
      'string.pattern.base': 'Merchant address must be a valid Ethereum address',
      'any.required': 'Merchant address is required'
    })
  });

  public static validateVerificationRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { error, value } = ValidationMiddleware.verificationRequestSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      ValidationMiddleware.logger.warn('Verification request validation failed', {
        errors: errorDetails,
        body: req.body
      });

      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errorDetails,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  }

  public static validateMerchantAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { error, value } = ValidationMiddleware.merchantAddressSchema.validate({
      merchantAddress: req.params.merchantAddress
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      ValidationMiddleware.logger.warn('Merchant address validation failed', {
        errors: errorDetails,
        merchantAddress: req.params.merchantAddress
      });

      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Invalid merchant address',
        code: 'INVALID_ADDRESS',
        details: errorDetails,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Replace params with validated data
    req.params.merchantAddress = value.merchantAddress;
    next();
  }

  public static validateContentType(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.get('Content-Type');
      
      if (!contentType || !contentType.includes('application/json')) {
        ValidationMiddleware.logger.warn('Invalid content type', {
          contentType,
          url: req.url,
          method: req.method
        });

        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Content-Type must be application/json',
          code: 'INVALID_CONTENT_TYPE',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    next();
  }

  public static validateRequestSize(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    const maxSize = 1024 * 1024; // 1MB

    if (contentLength > maxSize) {
      ValidationMiddleware.logger.warn('Request too large', {
        contentLength,
        maxSize,
        url: req.url
      });

      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Request too large',
        code: 'REQUEST_TOO_LARGE',
        details: {
          maxSize: `${maxSize} bytes`,
          received: `${contentLength} bytes`
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  }

  public static sanitizeInput(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Sanitize string inputs to prevent XSS
    const sanitizeString = (str: string): string => {
      return str
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .trim();
    };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      return obj;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    next();
  }
}
