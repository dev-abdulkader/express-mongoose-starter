import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { authValidation } from './auth.validation';
import verifyToken from '../../middlewares/verifyToken';

const router = express.Router();



// user login route
router.post(
  '/login',
 
  AuthController.loginUser
);







export const AuthRoute = router;
