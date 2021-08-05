import { Request, Response, NextFunction } from 'express';
import models from '../models';

export default {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;

      const { rows, count } = await models.Suppliers.findAndCountAll({
        limit: parseInt(limit || 20, 10),
        offset: parseInt(offset || 0, 10),
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
