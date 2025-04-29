// interface.ts
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  phone: string;
  userStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING' | 'DELETED';
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CUSTOMER' | 'DINMAJUR';
  password: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isDeliveryPerson: boolean;
  refreshToken?: string;
  refreshTokenExpiry?: Date;
  isRegistered: boolean;
  redirectUrl?: string;
  otp?: number;
  otpExpiry?: Date;
  otpToken?: string;
  dateOfBirth?: Date;
  isDeleted: boolean;
  deletedAt?: Date;

  // References
  profile: Types.ObjectId;  // One-to-One with Profile
  addresses: Types.ObjectId[];  // One-to-Many with Address
  services: Types.ObjectId[];  // One-to-Many with Service
  portfolio: Types.ObjectId[];  // One-to-Many with Portfolio
}
