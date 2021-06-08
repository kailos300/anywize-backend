import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import models from '../models';
import CustomersValidators from '../validators/customers';

export default {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { limit, offset } = req.query;

      const { rows, count } = await models.Customers.findAndCountAll({
        limit: parseInt(limit || 20, 10),
        offset: parseInt(offset || 0, 10),
        raw: true,
        where: {
          active: true,
          supplier_id: user.supplier_id,
        },
        order: [['id', 'DESC']],
      });

      res.set('x-total-count', count);

      return res.send(rows);
    } catch (err) {
      return next(err);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { user } = req;

      const customer = await models.Customers.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
        include: [{
          model: models.Tours,
          attributes: ['id', 'name'],
        }],
      });

      if (!customer) {
        throw createError(404, 'NOT_FOUND');
      }

      return res.send(customer);
    } catch (err) {
      return next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body, user } = req;

      await CustomersValidators.create(body);

      const tour = await models.Tours.findOne({
        where: {
          id: body.tour_id,
          supplier_id: user.supplier_id,
          active: true,
        },
        raw: true,
      });

      if (!tour) {
        throw createError(400, 'INVALID_TOUR');
      }

      const customer = await models.Customers.create({
        ...body,
        supplier_id: user.supplier_id,
      });

      return res.send(customer);
    } catch (err) {
      return next(err);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body, user } = req;
      const { id } = req.params;

      await CustomersValidators.update(body);

      const customer = await models.Customers.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
      });

      if (!customer) {
        throw createError(404, 'NOT_FOUND');
      }

      const tour = await models.Tours.findOne({
        where: {
          id: body.tour_id,
          supplier_id: user.supplier_id,
          active: true,
        },
        raw: true,
      });

      if (!tour) {
        throw createError(400, 'INVALID_TOUR');
      }

      const updated = await customer.update(body);

      return res.send(updated);
    } catch (err) {
      return next(err);
    }
  },
  destroy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { id } = req.params;

      const customer = await models.Customers.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
      });

      if (!customer) {
        return res.send({ status: 1 });
      }

      const customers = await models.Orders.count({
        where: {
          customer_id: customer.id,
        },
      });

      if (customers) {
        throw createError(400, 'CUSTOMER_CONTAINS_ORDERS');
      }

      await customer.destroy();

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
};
