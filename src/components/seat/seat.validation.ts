import Joi from 'joi';
import { ValidationSchema } from '@core/interfaces/validationSchema';

const createSeatValidation: ValidationSchema = {
  body: Joi.object().keys({
    eventId: Joi.string().required(),
    seatNumber: Joi.number().required(),
    isBooked: Joi.boolean().required(),
    bookedBy: Joi.string().required(),
  }),
};

export default createSeatValidation;
