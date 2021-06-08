import Joi from 'joi';
import Validate from './index';

const CreateSchema = Joi.object().keys({
  transport_agent_id: Joi.number().integer().required(),
  name: Joi.string().required(),
  description: Joi.string().optional().allow('', null),
  active: Joi.boolean().truthy(1, '1').falsy(1, '1').optional(),
});

const UpdateSchema = Joi.object().keys({
  transport_agent_id: Joi.number().integer().required(),
  name: Joi.string().required(),
  description: Joi.string().optional().allow('', null),
  active: Joi.boolean().truthy(1, '1').falsy(1, '1').optional(),
});

export default {
  create: (data) => Validate(data, CreateSchema),
  update: (data) => Validate(data, UpdateSchema),
};