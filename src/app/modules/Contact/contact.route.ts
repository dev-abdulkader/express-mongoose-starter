import express from 'express';

import { ContactController } from './contact.controller';


const router = express.Router();

// Create a new contact
router.post(
  '/create',
  
  ContactController.createContact
);

export const ContactRoute = router;
