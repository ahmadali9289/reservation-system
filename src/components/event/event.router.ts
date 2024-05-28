import { Router } from 'express';

import protectedByApiKey from '@core/middlewares/apiKey.middleware';
import validation from '@core/middlewares/validate.middleware';
import {
  createEvent,
  readEvent,
  updateEvent,
  deleteEvent,
} from './event.controller';
import createEventValidation from './createEvent.validation';

const router: Router = Router();

// createEvent request's body is validated and protected by api-key
router.post(
  '/event/',
  [protectedByApiKey, validation(createEventValidation)],
  createEvent,
);
router.get('/event/:id', readEvent);
router.put('/event/:id', [protectedByApiKey], updateEvent);
router.delete('/event/:eventId', [protectedByApiKey], deleteEvent);

export default router;
