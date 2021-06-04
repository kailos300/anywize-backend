import { Request, Response, NextFunction } from 'express';
import * as UsersLogic from '../logic/users';

export default {
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;

      return res.send(UsersLogic.getPublicInfo(user));
    } catch (err) {
      return next(err);
    }
  },
};
