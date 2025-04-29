

import bcrypt from 'bcryptjs';
import User from '../modules/User/user.model';

export const initiateSuperAdmin = async () => {
  const payload = {
    firstName: 'Super',
    lastName: 'Admin',
    phone: '1234567890',
    email: 'devabdulemail@gmail.com',
    password: '123456', // In production, store this securely or pull from env
    role: 'SUPER_ADMIN', // Adjust if your enum or value is different
  };

  try {
    // Check if super admin exists
    const existingSuperAdmin = await User.findOne({ email: payload.email });

    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 12);

    // Create super admin user
    const newUser = new User({
      ...payload,
      password: hashedPassword,
    });

    await newUser.save();
    console.log(`Super Admin created with ID: ${newUser._id}`);
  } catch (error) {
    console.error('Error creating Super Admin:', error);
  }
};
