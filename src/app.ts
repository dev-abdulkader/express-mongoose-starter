

import express, { Application, Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import bodyParser from 'body-parser';
import router from './app/routes';
import GlobalErrorHandler from './app/middlewares/globalErrorHandler';
import morgan from 'morgan';


const app: Application = express();

export const corsOptions = {
  origin: [
    'https://just-fix-client.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials (cookies, headers)
};

// Middleware setup
app.use(express.json());
app.use(morgan('dev')); // Remove in production
app.use(cors(corsOptions)); // CORS setup
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join('/app/uploads')));

// Handle OPTIONS request for CORS pre-flight
app.options('*', cors(corsOptions));

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send({
    message: 'Welcome to the API!',
  });
});

// API routes
app.use('/api/v1', router);

// Global error handler (handles all errors including Multer, JWT, Zod, etc.)
app.use(GlobalErrorHandler);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API NOT FOUND!',
    error: {
      path: req.originalUrl,
      message: 'Your requested path is not found!',
    },
  });
});

export default app;
