import express from 'express';
import { AuthRoute } from '../modules/Auth/auth.route';
import { UserRoute } from '../modules/User/user.route';


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

 
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
