import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import ApiError from '../../../errors/ApiErrors';
import config from '../../../config';
import mongoose from 'mongoose';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const result = await UserService.createUser(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const getStatistics = catchAsync(async (req: Request, res: Response) => {
  const data = await UserService.getStatistics();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User statistics retrieved successfully',
    data,
  });
});





const UserController = {
  createUser,
  getStatistics,
 
};

export default UserController;


