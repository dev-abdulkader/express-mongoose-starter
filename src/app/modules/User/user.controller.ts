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
    statusCode: result.statusCode,
    success: result.success,
    message: result.message,
    data: result.data,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId= req.params.id
  console.log("check user Id", userId)
  const payload = { ...req.body };

  if ('password' in payload) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password update is not allowed through this route');
  }

  const updatedUser = await UserService.updateUser(userId, payload);

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found or update failed');
  }

  const { password, ...userData } = updatedUser.toObject();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: userData,
  });
})


const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.getUser(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { password, ...rest } = user.toObject();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: rest,
  });
});

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await UserService.getAllUsers();
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    data: users,
  });
});

// Delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: null,
  });
});

const getProfileCompletion = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id.toString();
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or missing User ID');
  }
  // Calculate the profile completion percentage
  const result = await UserService.getProfileCompletion(userId);

  // Sending structured response with profile completion percentage
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile completion fetched successfully",
    data: result,
  });
});




const UserController = {
  createUser,
  getUser,
  getAllUsers,
  deleteUser,
  updateUser,
  getProfileCompletion
};

export default UserController;


