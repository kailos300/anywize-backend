import Joi from 'joi';
import Validate from './index';

const CreateSchema = Joi.object().keys({
  customer_id: Joi.number().integer().required(),
  description: Joi.string().required(),
  number: Joi.string().optional().allow(null, ''),
});

const ListDeliveredSchema = Joi.object().keys({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().required(),
});

export default {
  create: (data) => Validate(data, CreateSchema),
  update: (data) => Validate(data, CreateSchema),
  delivered: (data) => Validate(data, ListDeliveredSchema),
};
