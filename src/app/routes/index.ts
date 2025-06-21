import express from 'express';
import { AuthRoute } from '../modules/Auth/auth.route';
import { UserRoute } from '../modules/User/user.route';
import { ServiceProviderRoute } from './../modules/ServiceProvider/serviceProvider.route';


const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoute,
  },

  {
    path: '/auth',
    route: AuthRoute,
  },
  {
    path: '/service-providers',
    route: ServiceProviderRoute,
  },

 
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
