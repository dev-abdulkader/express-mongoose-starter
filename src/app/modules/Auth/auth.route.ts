import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { authValidation } from './auth.validation';
import verifyToken from '../../middlewares/verifyToken';

const router = express.Router();

router.post('/verify-registration-otp', 
  verifyToken(),
AuthController.verifyRegsitrationOtp);

// user login route
router.post(
  '/login',
  validateRequest(authValidation.loginValidationSchema),
  AuthController.loginUser
);

//send verification to email
router.post('/verify-user-redirect-token', 
  verifyToken(),
  AuthController.verifyUserRedirectToken);
//verify otp


router.post('/verify-user', 
  AuthController.verifyUser);



router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-forgot-password-otp',verifyToken(), AuthController.verifyForgotPasswordOtp);



export const AuthRoute = router;
