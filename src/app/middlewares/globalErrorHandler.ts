
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { MulterError } from 'multer';
import ApiError from '../../errors/ApiErrors';
import handleZodError from '../../errors/handleZodError';
import { IGenericErrorMessage } from '../../interfaces/error';
import config from '../../config';

const GlobalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message: string = 'Something went wrong!';
  let errorMessages: IGenericErrorMessage[] = [];

  // Zod validation error
  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }

  // Custom API error
  else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessages = error.message ? [{ path: '', message: error.message }] : [];
  }

  // JWT Token expired
  else if (error instanceof TokenExpiredError) {
    statusCode = httpStatus.UNAUTHORIZED;
    message = 'অননুমোদিত অনুরোধ। অনুগ্রহ করে আবার লগইন করুন।';
    errorMessages = [{ path: '', message }];
  }

  // JWT Invalid Token
  else if (error instanceof JsonWebTokenError) {
    statusCode = httpStatus.UNAUTHORIZED;
    message = 'Invalid token';
    errorMessages = [{ path: '', message }];
  }

  // Multer file upload error
  else if (error instanceof MulterError) {
    statusCode = httpStatus.BAD_REQUEST;
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Max size allowed is 5MB.';
    } else {
      message = 'File upload error.';
    }
    errorMessages = [{ path: '', message }];
  }

  // Native JS errors
  else if (error instanceof SyntaxError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Syntax error in the request.';
    errorMessages = [{ path: '', message }];
  } else if (error instanceof TypeError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = error.message || 'Type error occurred.';
    errorMessages = [{ path: '', message }];
  }
  
  else if (error instanceof ReferenceError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Reference error occurred.';
    errorMessages = [{ path: '', message }];
  }

  // Generic JS Error
  else if (error instanceof Error) {
    message = error.message;
    errorMessages = [{ path: '', message }];
  }

  // Fallback
  else {
    errorMessages = [{ path: '', message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    err: error,
    stack: config.env !== 'production' ? error?.stack : undefined,
  });
};

export default GlobalErrorHandler;
