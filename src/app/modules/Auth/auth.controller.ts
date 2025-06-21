import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthServices } from './auth.service';
import config from '../../../config';



const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthServices.loginUser({ email, password });

  const { refreshToken } = result;
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'লগইন সফল হয়েছে',
    data: result,
  });
});

export const AuthController = {

  
  loginUser
};


