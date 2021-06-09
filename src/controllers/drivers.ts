import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { getDriverJWT } from '../logic/users';
import models from '../models';

export default {
  authenticate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;

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
};
