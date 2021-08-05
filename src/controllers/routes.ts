import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import Sequelize from 'sequelize';
import models from '../models';
import RoutesLogic from '../logic/routes';
import RoutesValidators from '../validators/routes';
import { parseFilterDates, extendedQueryString } from '../logic/query';

const query = extendedQueryString({
  started: {
    key: 'start_date',
    func: (v) => {
      if (v === '1') {
        return {
          [Sequelize.Op.not]: null,
        };
      }

      return null;
    },
  },
  ended: {
    key: 'end_date',
    func: (v) => {
      if (v === '1') {
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
      const { start_date_to, start_date_from, ...rest } = where;
      const whereDates = parseFilterDates(req.query);

      const { rows, count } = await models.Routes.findAndCountAll({
        limit: parseInt(<any>limit || 20, 10),
        offset: parseInt(<any>offset || 0, 10),
        where: {
          tour_id: {
            [Sequelize.Op.in]: models.sequelize.literal(`(SELECT tours.id FROM tours WHERE supplier_id = ${user.supplier_id})`),
          },
          ...rest,
          ...whereDates,
        },
        order: [['id', 'DESC']],
        attributes: ['id', 'start_date', 'end_date', 'code', 'password', 'driver_name', 'driver_phone'],
        include: [{
          model: models.Tours,
          attributes: ['id', 'name'],
        }, {
          model: models.Orders,
          attributes: ['id', 'customer_id', 'description', 'delivered_at'],
        }],
        distinct: true,
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

      const route = await RoutesLogic.get({
        id,
        tour_id: {
          [Sequelize.Op.in]: models.sequelize.literal(`(SELECT tours.id FROM tours WHERE supplier_id = ${user.supplier_id})`),
        },
      });

      return res.send(route);
    } catch (err) {
      return next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body, user } = req;

      await RoutesValidators.create(body);

      const route = await RoutesLogic.create(body, user);

      return res.send(route);
    } catch (err) {
      return next(err);
    }
  },
  destroy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { id } = req.params;

      const route = await models.Routes.findOne({
        where: {
          id,
          tour_id: {
            [Sequelize.Op.in]: models.sequelize.literal(`(SELECT tours.id FROM tours WHERE supplier_id = ${user.supplier_id})`),
          },
        },
      });

      if (!route) {
        return res.send({ status: 1 });
      }

      if (route.start_date) {
        throw createError(400, 'ROUTE_STARTED');
      }

      await RoutesLogic.unlinkOrders(route);
      await route.destroy();

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
};
