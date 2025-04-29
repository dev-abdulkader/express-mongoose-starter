
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body); 
      req.body = parsed; 
          next();  
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation error from Zod
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      next(error);  
    }
  };
};

export default validateRequest;
