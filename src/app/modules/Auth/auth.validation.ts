import { z } from "zod";

const loginValidationSchema = z.object({
  phone: z.string(),
  password: z.string().min(6),

});
const changePasswordValidationSchema = z.object({

  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),

});

const refreshTokenValidationSchema = z.object({
    cookies: z.object({
      refreshToken: z.string({
        required_error: 'Refresh token is required!',
      }),
    }),
  });

export const authValidation={
  loginValidationSchema,
    changePasswordValidationSchema,
    refreshTokenValidationSchema
}
