import { Request, Response, NextFunction } from 'express';
import Sequelize from 'sequelize';
import createError from 'http-errors';
import { DateTime } from 'luxon';
import RoutesLogic from '../logic/routes';
import { getDriverJWT } from '../logic/users';
import models from '../models';
import DriversValidators from '../validators/drivers';

export default {
  authenticate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;

      await DriversValidators.login(body);

      const route: Route = await models.Routes.findOne({
        where: {
          end_date: null,
          code: body.code,
          password: body.password,
        },
        raw: true,
      });

      if (!route) {
        throw createError(400, 'INVALID_AUTH_OR_ROUTE');
      }

      const token = getDriverJWT(route);

      return res.send({
        token,
      });
    } catch (err) {
      return next(err);
    }
  },
  route: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.route;

      const route = await RoutesLogic.getRouteForDriver({
        uuid,
      });

      return res.send(route);
    } catch (err) {
      return next(err);
    }
  },
  createStop: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid, id } = req.route;
      const { body } = req;

      await DriversValidators.createStop(body);

      await models.Stops.create({
        ...body,
        route_id: id,
        location: {
          type: 'Point',
          coordinates: [body.longitude, body.latitude],
        },
      });

      await RoutesLogic.markOrdersAsDelivered(uuid, parseInt(body.customer_id, 10));

      const route = await RoutesLogic.getRouteForDriver({ uuid });

      return res.send(route);
    } catch (err) {
      return next(err);
    }
  },
  startRoute: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.route;

      const route = await models.Routes.findOne({
        where: { uuid },
        attributes: ['id', 'start_date', 'end_date'],
      });

      if (route.start_date) {
        return res.send({ status: 1 });
      }

      await route.update({ start_date: DateTime.now().toISO() });

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
  endRoute: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.route;

      const route = await models.Routes.findOne({
        where: {
          uuid,
          start_date: {
            [Sequelize.Op.not]: null,
          },
        },
        attributes: ['id', 'start_date', 'end_date'],
      });

      if (!route) {
        throw createError(404, 'NOT_FOUND');
      }

      if (route.end_date) {
        throw createError(400, 'ROUTE_ALREADY_ENDED');
      }

      await route.update({ end_date: DateTime.now().toISO() });

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
  location: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.route;
      const { body } = req;

      await DriversValidators.location(body);

      const route = await models.Routes.findOne({
        where: { uuid },
        attributes: ['id'],
        raw: true,
      });

      await models.DriversLocations.create({
        route_id: route.id,
        location: {
          type: 'Point',
          coordinates: [body.longitude, body.latitude],
        },
      });

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
};
