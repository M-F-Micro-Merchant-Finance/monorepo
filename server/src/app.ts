import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { ConfigService } from './services/config.service';
import { Logger } from './utils/logger';
import { VerificationController } from './controllers/verification.controller';
import { ErrorMiddleware, ValidationMiddleware } from './middleware';
import { HttpStatusCode } from './types/verification.types';

class App {
  private app: express.Application;
  private config: ConfigService;
  private logger: Logger;
  private verificationController: VerificationController;

  constructor() {
    this.app = express();
    this.config = ConfigService.getInstance();
    this.logger = Logger.getInstance();
    this.verificationController = new VerificationController();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: this.getAllowedOrigins(),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Request validation
    this.app.use(ValidationMiddleware.validateContentType);
    this.app.use(ValidationMiddleware.validateRequestSize);
    this.app.use(ValidationMiddleware.sanitizeInput);

    // Rate limiting
    this.app.use(this.createRateLimit());

    // Request logging
    this.app.use(this.createRequestLogger());
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(HttpStatusCode.OK).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api', this.createApiRoutes());

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(HttpStatusCode.OK).json({
        message: 'Merchant Identity Verification API',
        version: process.env.npm_package_version || '1.0.0',
        endpoints: {
          health: '/health',
          verify: '/api/verify/identity',
          status: '/api/verify/status/:merchantAddress',
          metrics: '/api/metrics'
        }
      });
    });

    // 404 handler
    this.app.use('*', ErrorMiddleware.handleNotFound);
  }

  private createApiRoutes(): express.Router {
    const router = express.Router();

    // Verification endpoints
    router.post('/verify/identity', 
      ValidationMiddleware.validateVerificationRequest,
      ErrorMiddleware.handleAsyncError(this.verificationController.verifyIdentity.bind(this.verificationController))
    );

    router.get('/verify/status/:merchantAddress',
      ValidationMiddleware.validateMerchantAddress,
      ErrorMiddleware.handleAsyncError(this.verificationController.getVerificationStatus.bind(this.verificationController))
    );

    // Frontend integration endpoint
    router.post('/merchant/onboard',
      ValidationMiddleware.validateContentType,
      ErrorMiddleware.handleAsyncError(this.verificationController.processMerchantOnboarding.bind(this.verificationController))
    );

    // System endpoints
    router.get('/health', 
      ErrorMiddleware.handleAsyncError(this.verificationController.getHealthStatus.bind(this.verificationController))
    );

    router.get('/metrics',
      ErrorMiddleware.handleAsyncError(this.verificationController.getMetrics.bind(this.verificationController))
    );

    return router;
  }

  private initializeErrorHandling(): void {
    this.app.use(ErrorMiddleware.handleError);
  }

  private getAllowedOrigins(): string[] {
    const origins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];
    
    if (this.config.isDevelopment()) {
      origins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000');
    }

    return origins;
  }

  private createRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.logger.warn('Rate limit exceeded', {
          ip: req.ip,
          url: req.url,
          method: req.method
        });
        res.status(HttpStatusCode.RATE_LIMIT_EXCEEDED).json({
          success: false,
          error: 'Too many requests from this IP, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: '15 minutes'
        });
      }
    });
  }

  private createRequestLogger() {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        };

        if (res.statusCode >= 400) {
          this.logger.warn('HTTP Request', logData);
        } else {
          this.logger.http('HTTP Request', logData);
        }
      });

      next();
    };
  }

  public async start(): Promise<void> {
    try {
      // Validate configuration
      this.config.validateConfig();

      const port = this.config.getConfig().port;
      
      this.app.listen(port, () => {
        this.logger.info('Server started successfully', {
          port,
          environment: this.config.getConfig().nodeEnv,
          version: process.env.npm_package_version || '1.0.0'
        });
      });

    } catch (error) {
      this.logger.error('Failed to start server', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start the application
const app = new App();
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

export default app;
