import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import config from "../config";
import ApiError from "../errors/ApiErrors";
import httpStatus from "http-status";



// Generic Token Generator
const generateToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string
): string => {
  const options: SignOptions = {
  algorithm: "HS256",
  expiresIn: expiresIn as `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}`,
}


  return jwt.sign(payload, secret, options);
};

// Generic Token Verifier
const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

// OTP Token Verifier
const verifyOtpToken = (otpToken: string, userOtp: string): boolean => {
  try {
    const decoded = verifyToken(
      otpToken,
      config.jwt.otp_token_secret as string
    ) as { email: string; otp: string; exp: number };

    if (Date.now() >= decoded.exp * 1000) {
      throw new ApiError(httpStatus.BAD_REQUEST, "OTP has expired.");
    }

    if (decoded.otp !== userOtp) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP.");
    }

    return true;
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired OTP token."
    );
  }
};

// Access Token Generator
const generateAccessToken = (payload: {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}): string => {
  const accessTokenSecret = config.jwt.access_token_secret;
  const expiresIn = config.jwt.access_token_expires_in || "1d";

  if (!accessTokenSecret) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "ACCESS_TOKEN_SECRET is not defined"
    );
  }

  return generateToken(payload, accessTokenSecret, expiresIn);
};

// Refresh Token Generator
const generateRefreshToken = (payload: { id: string }): string => {
  const refreshTokenSecret = config.jwt.refresh_token_secret;
  const expiresIn = config.jwt.refresh_token_expires_in || "7d";

  if (!refreshTokenSecret) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "REFRESH_TOKEN_SECRET is not defined"
    );
  }

  return generateToken(payload, refreshTokenSecret, expiresIn);
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
  verifyOtpToken,
  generateAccessToken,
  generateRefreshToken,
};
