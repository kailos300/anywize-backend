import Joi from 'joi';
import Validate from './index';

const CreateSchema = Joi.object().keys({
  customer_id: Joi.number().integer().required(),
  description: Joi.string().required(),
  number: Joi.string().optional().allow(null, ''),
});

export default {
  create: (data) => Validate(data, CreateSchema),
  update: (data) => Validate(data, CreateSchema),
};
