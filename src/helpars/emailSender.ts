import nodemailer from 'nodemailer';
import config from '../config';
import ApiError from '../errors/ApiErrors';

const emailSender = async (subject: string, email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  const emailTransport = transporter;

  const mailOptions = {
    from: `"" <${config.emailSender.email}>`,
    to: email,
    subject,
    html,
  };

  // Send the email
  try {
    const info = await emailTransport.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error: any) {
    console.error('Error sending email:', error);
    if (error.responseCode === 550) {
      throw new ApiError(400, 'Invalid email address or blocked sender');
    }

    if (error.responseCode === 421) {
      throw new ApiError(500, 'Service temporarily unavailable');
    }

    throw new ApiError(500, 'Error sending email');
  }
};

export default emailSender;
