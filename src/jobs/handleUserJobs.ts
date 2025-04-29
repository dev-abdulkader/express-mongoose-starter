import cron from 'node-cron';
import User from '../app/modules/User/user.model';

const handleExpiredUsers = async () => {
  try {
    const currentTime = new Date();

    // Find users with expired OTPs
    const usersToNullify = await User.find({
      userStatus: 'PENDING',
      otpExpiry: { $lt: currentTime },
      otp: { $ne: null },
    });

    if (usersToNullify.length > 0) {
      const userIds = usersToNullify.map((user) => user._id);

      await User.updateMany(
        { _id: { $in: userIds } },
        {
          $set: {
            otp: null,
            otpExpiry: null,
            otpToken: null, 
          },
        }
      );

      console.log(`Nullified OTPs and redirectLinks for ${userIds.length} users.`);
    } else {
      console.log('No expired OTPs found to nullify.');
    }

  } catch (error) {
    console.error('Error handling expired OTPs:', error);
  }
};

// Cron runs every minute
cron.schedule('* * * * *', async () => {
  console.log('Running OTP cleanup cron job...');
  await handleExpiredUsers();
});
