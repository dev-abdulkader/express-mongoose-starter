import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import config from "../config";
import ApiError from "../errors/ApiErrors";
import httpStatus from "http-status";

const generateToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string
): string => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  });

  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};


const verifyOtpToken = (otpToken: string, userOtp: string): boolean => {
  try {
    const decoded = jwtHelpers.verifyToken(
      otpToken,
      config.jwt.otp_token_secret as string
    ) as { email: string; otp: string; exp: number };

    if (Date.now() >= decoded.exp * 1000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP has expired.');
    }

    if (decoded.otp !== userOtp) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP.');
    }

    return true;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP token.');
  }
};



// Generate access token
const generateAccessToken = (payload: { id: string; email: string; role:string, firstName:string, lastName:string }) => {
  console.log(payload)
  const accessTokenSecret = config.jwt.access_token_secret;
  const expiresIn = config.jwt.access_token_expires_in || '1d'; 
  if (!accessTokenSecret) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'ACCESS_TOKEN_SECRET is not defined');
  }

  if (!accessTokenSecret) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'ACCESS_TOKEN_SECRET is not defined');
  }

  return jwt.sign(payload, accessTokenSecret, {
    algorithm: "HS256",
    expiresIn,
  });


};

// Generate refresh token
const generateRefreshToken = (payload: { id: string }) => {
  const refreshTokenSecret = config.jwt.refresh_token_secret;
  const expiresIn = config.jwt.refresh_token_expires_in || '7d';

  if (!refreshTokenSecret) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'REFRESH_TOKEN_SECRET is not defined');
  }

  return jwt.sign(payload, refreshTokenSecret, {
    algorithm: "HS256",
    expiresIn,
  });

  
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
  verifyOtpToken,
  generateAccessToken,
  generateRefreshToken
};