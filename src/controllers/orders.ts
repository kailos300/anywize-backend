import { Request, Response, NextFunction } from 'express';
import Sequelize from 'sequelize';
import createError from 'http-errors';
import models from '../models';
import OrdersValidators from '../validators/orders';
import { extendedQueryString } from '../logic/query';

const query = extendedQueryString({
  assigned_to_route: {
    key: 'route_id',
    func: (val) => {
      if (val === '1') {
        return {
          [Sequelize.Op.not]: null,
        };
      }

      return null;
    },
  },
});

export default {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { limit, offset } = req.query;
      const { where } = query(req.query);

      const { rows, count } = await models.Orders.findAndCountAll({
        limit: parseInt(<any>limit || 20, 10),
        offset: parseInt(<any>offset || 0, 10),
        order: [['id', 'DESC']],
        where: {
          supplier_id: user.supplier_id,
          ...where,
        },
      });

      res.set('x-total-count', count);

      return res.send(rows);
    } catch (err) {
      return next(err);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { id } = req.params;

      const order = await models.Orders.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
        include: [{
          model: models.Customers,
          attributes: [
            'id', 'tour_id', 'tour_position', 'name', 'alias',
            'street', 'street_number', 'city', 'zipcode', 'country', 'email', 'phone',
          ],
        }],
      });

      if (!order) {
        throw createError(404, 'NOT_FOUND');
      }

      return res.send(order);
    } catch (err) {
      return next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, body } = req;

      await OrdersValidators.create(body);

      const customer = await models.Customers.count({
        where: {
          id: body.customer_id,
          supplier_id: user.supplier_id,
        },
      });

      if (!customer) {
        throw createError(400, 'INVALID_CUSTOMER');
      }

      const order = await models.Orders.create({
        ...body,
        supplier_id: user.supplier_id,
      });

      return res.send(order);
    } catch (err) {
      return next(err);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, body } = req;
      const { id } = req.params;

      await OrdersValidators.update(body);

      const order = await models.Orders.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
      });

      if (!order) {
        throw createError(404, 'NOT_FOUND');
      }

      if (order.route_id) {
        throw createError(400, 'ORDER_ALREADY_IN_ROUTE');
      }

      const customer = await models.Customers.count({
        where: {
          id: body.customer_id,
          supplier_id: user.supplier_id,
        },
      });

      if (!customer) {
        throw createError(400, 'INVALID_CUSTOMER');
      }

      const updated = await order.update(body);

      return res.send(updated);
    } catch (err) {
      return next(err);
    }
  },
  destroy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { id } = req.params;

      const order = await models.Orders.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
      });

      if (!order) {
        return res.send({ status: 1 });
      }

      if (order.route_id) {
        throw createError(400, 'ORDER_ALREADY_IN_ROUTE');
      }

      await order.destroy();

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
};
