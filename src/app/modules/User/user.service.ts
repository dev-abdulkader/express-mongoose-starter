/*eslint-disable*/

import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import config from '../../../config';
import { ObjectId } from 'mongodb';
import emailSender from '../../../helpars/emailSender';
import User from './user.model'; // Mongoose model
import { UserStatus } from '../../../constants';
import formatPhoneNumber from '../../../helpars/phoneHelper';
import axios from 'axios';
import { jwtHelpers } from '../../../helpars/jwtHelpers';
import { Secret } from 'jsonwebtoken';
import Profile from '../Profile/profile.model';
import Address from '../Address/address.model';
import Service from '../Services/service.model';
import Portfolio from '../Portfolio/portfolio.model';
import mongoose from 'mongoose';

const createUser = async (payload: {
  phone: string;
  role: string;
  password: string;
}) => {
  const { phone, role, password } = payload;
  const formattedPhone = formatPhoneNumber(phone);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ phone: formattedPhone }).session(
      session
    );

    // If the user exists and phone is verified, return an error
    if (existingUser?.isPhoneVerified) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'এই ফোন নম্বর দিয়ে অ্যাকাউন্টটি ইতিমধ্যেই নিবন্ধিত। অন্য ফোন নম্বর ব্যবহার করুন অথবা লগইন করুন।'
      );
    }

    const OTP_EXPIRY_MINUTES = 2;
    const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;

    // If the user exists and OTP is expired, update the OTP, OTP token, and expiry
    if (existingUser) {
      if (existingUser?.otpExpiry && existingUser.otpExpiry > new Date()) {
        const secondsLeft = Math.ceil(
          (existingUser.otpExpiry.getTime() - Date.now()) / 1000
        );
        await session.abortTransaction();
        session.endSession();
        return {
          success: true,
          message: `নতুন OTP অনুরোধ করার আগে অনুগ্রহ করে ${secondsLeft} সেকেন্ড অপেক্ষা করুন`,
          statusCode: httpStatus.OK,
          data: {
            user: {
              id: existingUser._id,
              phone: existingUser.phone,
            },
            expiresInSeconds: secondsLeft,
            token: existingUser.otpToken,
          },
        };
      } else {
        // OTP is expired, update it with a new one
        const otp = Math.floor(1000 + Math.random() * 9000);
        const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
        const token = jwtHelpers.generateToken(
          {
            id: existingUser._id,
            phone: formattedPhone,
            role,
          },
          config.jwt.jwt_secret as Secret,
          `${OTP_EXPIRY_MINUTES}m`
        );

        // Update OTP, OTP token, and expiry in the existing user
        existingUser.otp = otp;
        existingUser.otpToken = token;
        existingUser.otpExpiry = otpExpiry;

        await existingUser.save({ session });

        const message = `Your Dinmajur OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minute${OTP_EXPIRY_MINUTES > 1 ? 's' : ''}.`;
        const encodedMessage = encodeURIComponent(message);

        const apiUrl = `http://bulksmsbd.net/api/smsapi?api_key=${config.bulk_sms_api_key}&type=text&number=${formattedPhone}&senderid=${config.bulk_sms_sender_id}&message=${encodedMessage}`;
        const response = await axios.get(apiUrl);

        if (response.data?.response_code !== 202) {
          throw new ApiError(
            httpStatus.FAILED_DEPENDENCY,
            response.data?.error_message || 'Failed to send OTP via SMS'
          );
        }

        await session.commitTransaction();
        session.endSession();

        return {
          success: true,
          message: 'OTP সফলভাবে পাঠানো হয়েছে',
          statusCode: httpStatus.OK,
          data: {
            user: {
              id: existingUser._id,
              phone: existingUser.phone,
            },
            token,
            expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
          },
        };
      }
    }

    // If no existing user, create a new one
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = new mongoose.Types.ObjectId();

    const token = jwtHelpers.generateToken(
      {
        id: userId,
        phone: formattedPhone,
        role,
      },
      config.jwt.jwt_secret as Secret,
      `${OTP_EXPIRY_MINUTES}m`
    );

    const user = new User({
      _id: userId,
      phone: formattedPhone,
      otp,
      otpExpiry,
      otpToken: token,
      password: hashedPassword,
      role,
      isRegistered: false,
      isPhoneVerified: false,
      isEmailVerified: false,
      userStatus: UserStatus.PENDING,
    });

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

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: 'OTP সফলভাবে পাঠানো হয়েছে',
      statusCode: httpStatus.CREATED,
      data: {
        user: {
          id: user._id,
          phone: user.phone,
        },
        token,
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('SMS API or User creation error:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user or send OTP. Please try again.'
    );
  }
};

const updateUser = async (userId: string, payload: Partial<typeof User>) => {
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

const getUser = async (id: string) => {
  const user = await User.findById(id).select('_id phone email role'); // Select specific fields

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

// Get All Users
const getAllUsers = async () => {
  const users = await User.find({ isDeleted: false }); // Fetch non-deleted users

  return users;
};

// Delete User
const deleteUser = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const getProfileCompletion = async (userId: string) => {
  const [profile, addresses, services, portfolios] = await Promise.all([
    Profile.findOne({ userId }),
    Address.find({ userId }),
    Service.find({ userId }),
    Portfolio.find({ userId }),
  ]);

  let totalFields = 0;
  let filledFields = 0;

  // --- Profile (10 fields)
  const profileFields = [
    'firstName',
    'lastName',
    'profilePicture',
    'gender',
    'dateOfBirth',
    'profession',
    'dailyWages',
    'experience',
    'bio',
  ];

  totalFields += profileFields.length + 1; // +1 for skills
  if (profile) {
    for (const field of profileFields) {
      if ((profile as any)[field]) filledFields++;
    }
    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
      filledFields++;
    }
  }

  // --- Address (7 fields, use the first address)
  const addressFields = [
    'type',
    'thana',
    'district',
    'division',
    'fullAddress',
    'postalCode',
    'country',
  ];
  totalFields += addressFields.length;
  if (addresses.length > 0) {
    const address = addresses[0];
    for (const field of addressFields) {
      if ((address as any)[field]) filledFields++;
    }
  }

  // --- Service (2 fields, use the first service)
  totalFields += 2;
  if (services.length > 0) {
    const service = services[0];
    if (service.category) filledFields++;
    if (Array.isArray(service.services) && service.services.length > 0)
      filledFields++;
  }

  // --- Portfolio (4 fields, use the first portfolio)
  const portfolioFields = ['title', 'description', 'thumbnail'];
  totalFields += portfolioFields.length + 1; // +1 for images array
  if (portfolios.length > 0) {
    const portfolio = portfolios[0];
    for (const field of portfolioFields) {
      if ((portfolio as any)[field]) filledFields++;
    }
    if (Array.isArray(portfolio.images) && portfolio.images.length > 0)
      filledFields++;
  }

  // --- Calculate percentage
  const completionPercentage = Math.round((filledFields / totalFields) * 100);

  return {
    filledFields,
    totalFields,
    completionPercentage,
  };
};
export const UserService = {
  createUser,
  getUser,
  getAllUsers,
  deleteUser,
  updateUser,
  getProfileCompletion,
};

// const uploadProfilePicture = async (
//   userId: string,
//   profilePicture: { url: string; altText: string }
// ) => {
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }

//   // Update or create profile with picture
//   const profile = await Profile.findOneAndUpdate(
//     { userId },
//     { profilePicture },
//     { upsert: true, new: true }
//   );

//   return profile;
// };
