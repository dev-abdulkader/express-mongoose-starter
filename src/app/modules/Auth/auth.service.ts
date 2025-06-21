import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import emailSender from '../../../helpars/emailSender';
import { jwtHelpers } from '../../../helpars/jwtHelpers';
import ApiError from '../../../errors/ApiErrors';
import axios from 'axios';

import User from '../User/user.model';
import { verify } from 'crypto';
import formatPhoneNumber from '../../../helpars/phoneHelper';
import { UserStatus } from '../../../constants';



const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  user: any;
}> => {
  

  // Check if user exists by phone
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ইউজার খুঁজে পাওয়া যায়নি');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'ভুল পাসওয়ার্ড প্রবেশ করা হয়েছে'
    );
  }

 

  // Create JWT payload
  const jwtPayload = {
    id: user._id,
    phone: user.phone,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  // Generate tokens
  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user,
  };
};

export const AuthServices = {
  
  loginUser,
};
