import { Request, Response, NextFunction } from 'express';
import models from '../models';

export default {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;

      const { rows, count } = await models.Suppliers.findAndCountAll({
        limit: limit || 20,
        offset: offset || 0,
        attributes: ['id', 'name', 'alias', 'created_at', 'active'],
        raw: true,
      });

      res.set('x-total-count', count);

      return res.send(rows);
    } catch (err) {
      return next(err);
    }
  },
};
