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

const verifyRegsitrationOtp = async (payload: {
  userId: string;
  otp: number;
}) => {
  const user = await User.findOne({
    _id: payload.userId,
    otp: Number(payload.otp),
    otpExpiry: { $gt: new Date() },
  }).select(
    '_id firstName lastName  role phone phoneVerified userStatus hasPassword isRegistered'
  );
  console.log('user is ', user);

  if (!user) {
    const expiredCheck = await User.findOne({
      _id: payload.userId,
      otp: Number(payload.otp),
      otpExpiry: { $lte: new Date() },
    });

    if (expiredCheck) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP এর মেয়াদ শেষ হয়েছে');
    }
    throw new ApiError(httpStatus.NOT_FOUND, 'ভুল OTP প্রবেশ করা হয়েছে');
  }

  // Update user verification and status
  user.otp = null;
  user.otpExpiry = null;
  user.isPhoneVerified = true;
  user.otpToken = null;
  user.userStatus = UserStatus.ACTIVE;
  await user.save();

  // Create JWT tokens
  const jwtPayload = {
    id: user._id,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as string,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user,
  };
};

const verifyUserRedirectToken = async (userId: string) => {
  const user = await User.findById(userId).select('otpExpiry redirectUrl');

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.otpExpiry && user.otpExpiry > new Date()) {
    const secondsLeft = Math.ceil(
      (user.otpExpiry.getTime() - Date.now()) / 1000
    );
    return {
      expiresInSeconds: secondsLeft,
    };
  }
};

const verifyUser = async (userId: string) => {
  const user = await User.findById(userId).select('otpExpiry redirectUrl');

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return null;
};

const forgotPassword = async (phone: string) => {
  console.log('Forgot Password for phone:', phone);

  const formattedPhone = formatPhoneNumber(phone);

  const existingUser = await User.findOne({ phone: formattedPhone });

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this phone number does not exist.'
    );
  }

  const OTP_EXPIRY_MINUTES = 1;
  const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;

  if (existingUser?.otpExpiry && existingUser.otpExpiry > new Date()) {
    const secondsLeft = Math.ceil(
      (existingUser.otpExpiry.getTime() - Date.now()) / 1000
    );
    return {
      success: true,
      message: `Please wait ${secondsLeft} seconds before requesting a new OTP`,
      data: {
        user: {
          id: existingUser._id,
          phone: existingUser.phone,
          isRegistered: existingUser.isRegistered,
        },
        token: existingUser.otpToken,
        expiresInSeconds: secondsLeft,
      },
    };
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

  // Update OTP and expiry for password recovery
  existingUser.otp = otp;
  existingUser.otpExpiry = otpExpiry;

  try {
    const message = `Your OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minute${OTP_EXPIRY_MINUTES > 1 ? 's' : ''}.`;
    const encodedMessage = encodeURIComponent(message);

    const apiUrl = `http://bulksmsbd.net/api/smsapi?api_key=${config.bulk_sms_api_key}&type=text&number=${formattedPhone}&senderid=${config.bulk_sms_sender_id}&message=${encodedMessage}`;

    const response = await axios.get(apiUrl);

    if (response.data?.response_code !== 202) {
      throw new ApiError(
        httpStatus.FAILED_DEPENDENCY,
        response.data?.error_message || 'Failed to send OTP via SMS'
      );
    }

    const token = jwtHelpers.generateToken(
      {
        id: existingUser._id,
        phone: existingUser.phone,
        role: existingUser.role,
      },
      config.jwt.jwt_secret as Secret,
      `${OTP_EXPIRY_MINUTES}m`
    );


    await existingUser.save();

    return {
      success: true,
      message: 'OTP sent successfully for password reset',
      data: {
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
        token,
        user: {
          id: existingUser._id,
          isRegistered: existingUser.isRegistered,
          phoneVerified: existingUser.isPhoneVerified,
          emailVerified: existingUser.isEmailVerified,
        },
      },
    };
  } catch (error) {
    console.error('SMS API Error:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to send OTP via SMS. Please try again.'
    );
  }
};

const verifyForgotPasswordOtp = async (payload: {
  userId: string;
  otp: number;
}) => {
  const user = await User.findOne({
    _id: payload.userId,
    otp: Number(payload.otp),
    otpExpiry: { $gt: new Date() },
  }).select(
    '_id firstName lastName phone phoneVerified userStatus hasPassword isRegistered redirectUrl'
  );

  if (!user) {
    const expiredCheck = await User.findOne({
      _id: payload.userId,
      otp: Number(payload.otp),
      otpExpiry: { $lte: new Date() },
    });

    if (expiredCheck) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP এর মেয়াদ শেষ হয়েছে');
    }
    throw new ApiError(httpStatus.NOT_FOUND, 'ভুল OTP প্রবেশ করা হয়েছে');
  }

  // Update OTP and OTP expiry for password reset
  user.otp = null;
  user.otpExpiry = null;
  user.otpToken = null;

  // Save the updated user
  await user.save();

  // Create JWT tokens for further validation
  const jwtPayload = {
    id: user._id,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as string,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user,
  };
};

const loginUser = async (payload: {
  phone: string;
  password: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  user: any;
}> => {
  const formattedPhone = formatPhoneNumber(payload.phone);

  // Check if user exists by phone
  const user = await User.findOne({ phone: formattedPhone }).select(
    '_id firstName lastName role phone isPhoneVerified userStatus isRegistered password'
  );

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

  // Ensure user is verified and active
  if (!user.isPhoneVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, 'ফোন নম্বর যাচাই করা হয়নি');
  }
  if (user.userStatus !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, 'ইউজার অ্যাকাউন্ট সক্রিয় নয়');
  }

  // Create JWT payload
  const jwtPayload = {
    id: user._id,
    phone: user.phone,
    role: user.role,
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
    user: {
      _id: user._id,
      id: user._id,
      phone: user.phone,
      role: user.role,
      userStatus: user.userStatus,
      isRegistered: user.isRegistered,
      isPhoneVerified: user.isPhoneVerified,
    },
  };
};

export const AuthServices = {
  verifyUserRedirectToken,
  verifyRegsitrationOtp,
  verifyUser,
  forgotPassword,
  verifyForgotPasswordOtp,
  loginUser,
};
