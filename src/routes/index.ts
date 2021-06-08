import * as express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated';
import isAdmin from '../middlewares/isAdmin';
import models from '../models';
const _package = require('../../package.json');

const router = express.Router();

import auth from './auth';
import suppliers from './suppliers';
import users from './users';
import tours from './tours';
import customers from './customers';

router.get('/ping', async (req, res, next) => {
  try {
    await models.Users.findOne();

    return res.send(`Pong ${_package.version}`);
  } catch (err) {
    return next(err);
  }
});

router.use('/api/auth', auth);
router.use('/api/suppliers', isAuthenticated, isAdmin, suppliers);
router.use('/api/users', isAuthenticated, users);
router.use('/api/tours', isAuthenticated, tours);
router.use('/api/customers', isAuthenticated, customers);

export default router;