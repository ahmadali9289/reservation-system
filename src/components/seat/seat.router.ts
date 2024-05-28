import { Router } from 'express';

import protectedByApiKey from '@core/middlewares/apiKey.middleware';
import validation from '@core/middlewares/validate.middleware';
import {
  createSeat,
  readSeat,
  readAllEventSeats,
  updateSeat,
  deleteSeat,
  bookSeat,
} from './seat.controller';
import createSeatValidation from './seat.validation';

const router: Router = Router();

// createSeat request's body is validated and protected by api-key
router.post(
  '/event/:eventId/seats',
  [protectedByApiKey, validation(createSeatValidation)],
  createSeat,
);
router.post(
  '/event/:eventId/seat/:seatId/reserve',
  protectedByApiKey,
  bookSeat,
);
router.get('/event/:eventId/seats', readAllEventSeats);
router.get('/event/:eventId/seat/:seatId', readSeat);
router.put('/event/:eventId/seat/:seatId', [protectedByApiKey], updateSeat);
router.delete('/event/:eventId/seat/:seatId', [protectedByApiKey], deleteSeat);

export default router;
