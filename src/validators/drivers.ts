import Joi from 'joi';
import Validate from './index';

const LoginSchema = Joi.object().keys({
  code: Joi.string().required(),
  password: Joi.string().required(),
});

const LocationSchema = Joi.object().keys({
  latitude: Joi.number().precision(8).required(),
  longitude: Joi.number().precision(8).required(),
});

const CreateStopSchema = Joi.object().keys({
  customer_id: Joi.number().integer().required(),
  time: Joi.date().iso().required(),
  customer_signed: Joi.boolean().truthy(1, '1').falsy(0, '0').required(),
  latitude: Joi.number().precision(8).required(),
  longitude: Joi.number().precision(8).required(),
  meet_customer: Joi.boolean().truthy(1, '1').falsy(0, '0').required(),
  reason: Joi.string().optional().allow(null, ''),
  driver_name: Joi.string().required(),
  goods_back: Joi.boolean().truthy(1, '1').falsy(0, '0').required(),
});

export default {
  login: (data) => Validate(data, LoginSchema),
  location: (data) => Validate(data, LocationSchema),
  createStop: (data) => Validate(data, CreateStopSchema),
};
