import { Router } from 'express';
import UsersCtrl from '../controllers/users';

const router = Router();

/**
 * @api {get} /api/users/me Get logged in user
 * @apiName Get logged in user
 * @apiGroup Users
 * @apiDescription Returns the currently logged in user
 *
 * @apiParamExample {json} Request-Example:
 *     GET /api/users/me
 *
 * @apiSuccessExample Success-Response:
 *    [{
 *      id: 1,
 *      name: "Supplier",
 *      alias: "Supplier alias",
 *      active: true,
 *      created_at: "2021-01-01T12:00:00"
 *    }]
 *
 * @apiErrorExample Error unauthenticated:
 *     HTTP/1.1 401
 *
 */
router.get('/', UsersCtrl.me);

export default router;
