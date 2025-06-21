import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

import verifyToken from '../../middlewares/verifyToken';
import { ServiceProviderController } from './serviceProvider.controller';

const router = express.Router();



// user login route
router.get(
  '/categories',
 
  ServiceProviderController.getCategories
);
router.get(
  '/',
  ServiceProviderController.getServiceProviders
);
router.get('/:id',
  ServiceProviderController.getServiceProvidersById
);







export const ServiceProviderRoute = router;
