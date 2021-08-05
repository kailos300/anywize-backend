import createError from 'http-errors';
import { Request, Response, NextFunction } from 'express';

export default function (req: Request, res: Response, next: NextFunction) {
  if (!req.user.supplier_id) {
    return next(createError(403, 'FORBIDDEN'));
  }

  return next();
}
