import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    firstName:{ type: String, unique: false, required: true },
    lastName:{ type: String, unique: false, required: true },
    phone: { type: String, unique: true, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'USER','SERVICE_PROVIDER', 'CUSTOMER'],
      required: true,
      default: 'USER',
    },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    userStatus: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING', 'DELETED'],
      
    },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean },
    isPhoneVerified: { type: Boolean },
    
profession: {
      type: String,
      required: false,
      enum: ['Electrician', 'Plumber', 'Painter', 'Cleaner', 'Mechanic', 'AC Repair', 'Tech Support', 'Carpenter', 'Gardener'],
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    experienceYears: {
      type: Number,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      min: 0,
      required: false,
    },
    profilePicture: { type: String },
    location: {
      type: String ,
    },

    refreshToken: { type: String },
    refreshTokenExpiry: { type: Date },
    isRegistered: { type: Boolean, },
    otp: { type: Number },
    otpExpiry: { type: Date },
    otpToken: { type: String },
    dateOfBirth: { type: Date },
    isDeleted: { type: Boolean },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);



// Indexes
UserSchema.index({ userStatus: 1 });
UserSchema.index({ role: 1 });

const User = model('User', UserSchema);

export default User;
