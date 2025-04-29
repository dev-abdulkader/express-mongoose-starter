import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    phone: { type: String, unique: true, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'USER', 'CUSTOMER', 'DINMAJUR'],
      required: true,
      default: 'USER',
    },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    userStatus: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING', 'DELETED'],
      default: 'PENDING',
    },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isDeliveryPerson: { type: Boolean, default: false },
    refreshToken: { type: String },
    refreshTokenExpiry: { type: Date },
    isRegistered: { type: Boolean, default: false },
    otp: { type: Number },
    otpExpiry: { type: Date },
    otpToken: { type: String },
    dateOfBirth: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual fields
UserSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true, // because one user has one profile
});

UserSchema.virtual('addresses', {
  ref: 'Address',
  localField: '_id',
  foreignField: 'userId',
});

UserSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'userId',
});

UserSchema.virtual('portfolio', {
  ref: 'Portfolio',
  localField: '_id',
  foreignField: 'userId',
});

// Indexes
UserSchema.index({ userStatus: 1 });
UserSchema.index({ role: 1 });

const User = model('User', UserSchema);

export default User;
