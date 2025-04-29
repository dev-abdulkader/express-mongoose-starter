import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthServices } from './auth.service';
import config from '../../../config';

const verifyRegsitrationOtp = catchAsync(async (req: Request, res: Response) => {
  const {otp } = req.body;
  const userId = req.user._id.toString();
  console.log("userId is", userId);
  console.log("otp is ", otp)
  const result = await AuthServices.verifyRegsitrationOtp({ userId, otp });

  const {refreshToken}=result
    res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'OTP verified successfully',
    data: result,
  });
});



const verifyUserRedirectToken = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const result = await AuthServices.verifyUserRedirectToken(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User token verified successfully',
    data: result,
  });
});


const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const result = await AuthServices.verifyUser(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User  verified successfully',
    data: result,
  });
});


const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.body;
  console.log("phone nubmer is", phone)
  const result = await AuthServices.forgotPassword(phone);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: result.success,
    message: result.message,
    data: result.data,
  });
})

const verifyForgotPasswordOtp = catchAsync(async (req: Request, res: Response) => {
  const { userId, otp } = req.body;
  const result = await AuthServices.verifyForgotPasswordOtp({ userId, otp });

  const { refreshToken } = result;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully for password reset',
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const result = await AuthServices.loginUser({ phone, password });

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

  verifyUserRedirectToken,
  verifyRegsitrationOtp,
  verifyUser,
  forgotPassword,
  verifyForgotPasswordOtp,
  loginUser
};


