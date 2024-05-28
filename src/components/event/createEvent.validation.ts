import Joi from 'joi';
import { ValidationSchema } from '@core/interfaces/validationSchema';

const createEventValidation: ValidationSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    dateTime: Joi.string().required(),
    totalSeats: Joi.number().required(),
  }),
};

export default createEventValidation;
