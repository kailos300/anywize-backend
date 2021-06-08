import Joi from 'joi';
import Validate from './index';

const CreateSchema = Joi.object().keys({
  tour_id: Joi.number().integer().required(),
  tour_position: Joi.number().integer().required(),
  name: Joi.string().required(),
  alias: Joi.string().required(),
  street: Joi.string().required(),
  street_number: Joi.string().required(),
  city: Joi.string().required(),
  zipcode: Joi.string().required(),
  country: Joi.string().min(2).max(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  sms_notifications: Joi.boolean().truthy(1, '1').falsy(1, '1').optional(),
  email_notifications: Joi.boolean().truthy(1, '1').falsy(1, '1').optional(),
  active: Joi.boolean().truthy(1, '1').falsy(1, '1').optional(),
});

export default {
  create: (data) => Validate(data, CreateSchema),
  update: (data) => Validate(data, CreateSchema),
};
