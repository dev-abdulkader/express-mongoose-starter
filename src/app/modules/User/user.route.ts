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
  validateRequest(createUserValidation),
  UserController.createUser
);

// 🔀 STATIC or semi-static routes BEFORE dynamic ones
router.get('/profile-completion',auth(), UserController.getProfileCompletion);

// Dynamic route LAST
router.get('/:id', UserController.getUser);

// Update a user by ID
router.put(
  '/:id',
  auth(),
  validateRequest(updateUserValidation),
  UserController.updateUser
);

export const UserRoute = router;
