/*eslint-disable*/
import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import config from '../../../config';
import { ObjectId } from 'mongodb';
import emailSender from '../../../helpars/emailSender';

import { UserStatus } from '../../../constants';
import formatPhoneNumber from '../../../helpars/phoneHelper';
import axios from 'axios';
import { jwtHelpers } from '../../../helpars/jwtHelpers';
import { Secret } from 'jsonwebtoken';

import mongoose, { Types } from 'mongoose';
import User from '../User/user.model';


const getCategories = async (): Promise<{ name: string; total: number }[]> => {
  const categories = await User.aggregate([
    {
      $match: { role: 'SERVICE_PROVIDER' }
    },
    {
      $group: {
        _id: '$profession',
        total: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        total: 1
      }
    },
    {
      $sort: { name: 1 } // Optional: alphabetically sort by name
    }
  ]);

  if (!categories || categories.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No service provider categories found');
  }

  return categories;
};
const getProvidersByCategory = async (category: string) => {
  return User.find({
    profession: { $regex: new RegExp(`^${category}$`, 'i') },
    role: 'SERVICE_PROVIDER',
  });
};

const getAllServiceProviders = async () => {
  const providers = await User.find({ role: 'SERVICE_PROVIDER' }).select('-password'); // Hide password
  return providers;
};
const getServiceProviderById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid ID format');
  }

  const provider = await User.findOne({ _id: id, role: 'SERVICE_PROVIDER' }).select('-password');

  if (!provider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service provider not found');
  }

  return provider;
};

    export const ServiceProviderServices = {
        getCategories,
        getAllServiceProviders,
        getServiceProviderById,
        getProvidersByCategory
    };