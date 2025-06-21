import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import UserController from './user.controller';
import { createUserValidation, updateUserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../../helpars/fileUploader';

const router = express.Router();

// Create a new user
router.post(
  '/create',
  
  UserController.createUser
);
router.get(
  '/statistics',
  
  UserController.getStatistics
);



export const UserRoute = router;
