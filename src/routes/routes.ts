import { Router } from 'express';
import RoutesCtrl from '../controllers/routes';
import userHasSupplier from '../middlewares/userHasSupplier';

const router = Router();

/**
 * @api {get} /api/routes/:id Get single route
 * @apiName Get single route
 * @apiGroup Routes
 * @apiDescription Returns a single route with all of its related data
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/routes/1
 *
 * @apiSuccessExample Success-Response:
 *    {
 *      "id": 4,
 *      "tour_id": 3,
 *      "uuid": "3f1943d0-c9eb-11eb-9585-374befa75bfc",
 *      "pathway": [
 *        {
 *          "id": 7,
 *          "city": "City 2",
 *          "name": "Bruen, Halvorson and Carter",
 *          "alias": "Klein Inc",
 *          "email": "macy61@yahoo.com",
 *          "phone": "123321312312",
 *          "Orders": [
 *            {
 *              "id": 8,
 *              "number": "number",
 *              "customer_id": 7,
 *              "description": "This is the order description for Bruen, Halvorson and Carter",
 *              "supplier_id": 1
 *            }
 *          ],
 *          "street": "st",
 *          "country": "BR",
 *          "tour_id": 3,
 *          "zipcode": "123",
 *          "latitude": 4.14001,
 *          "longitude": 11.000001,
 *          "coordinates": {
 *            "type": "Point",
 *            "coordinates": [
 *              11.000001,
 *              4.14001
 *            ]
 *          },
 *          "street_number": "123123",
 *          "tour_position": 1
 *        },
 *        {
 *          "id": 8,
 *          "city": "City 2",
 *          "name": "Sipes - Okuneva",
 *          "alias": "Thompson, Berge and Stark",
 *          "email": "madisyn.ullrich86@hotmail.com",
 *          "phone": "123321312312",
 *          "Orders": [
 *            {
 *              "id": 9,
 *              "number": "number",
 *              "customer_id": 8,
 *              "description": "This is the order description for Sipes - Okuneva",
 *              "supplier_id": 1
 *            },
 *            {
 *              "id": 10,
 *              "number": "number",
 *              "customer_id": 8,
 *              "description": "This is the order description for Sipes - Okuneva",
 *              "supplier_id": 1
 *            }
 *          ],
 *          "street": "st",
 *          "country": "BR",
 *          "tour_id": 3,
 *          "zipcode": "123",
 *          "latitude": 4.14001,
 *          "longitude": 11.000001,
 *          "coordinates": {
 *            "type": "Point",
 *            "coordinates": [
 *              11.000001,
 *              4.14001
 *            ]
 *          },
 *          "street_number": "123123",
 *          "tour_position": 1
 *        },
 *      ],
 *      "start_date": null,
 *      "end_date": null,
 *      "code": "ZOIBDM",
 *      "password": "8756",
 *      "Tour": {
 *        "id": 3,
 *        "supplier_id": 1,
 *        "transport_agent_id": 1,
 *        "name": "Tour: Considine, Cassin and Zulauf",
 *        "description": "this is the tour 1",
 *        "active": true,
 *        "updated_at": "2021-06-10T12:56:17.000Z",
 *        "created_at": "2021-06-10T12:56:17.000Z",
 *        "TransportAgent": {
 *          "id": 1,
 *          "name": "Name - Breitenberg and Sons",
 *          "alias": "Alias - Olson - Breitenberg",
 *          "street": "street",
 *          "street_number": "123123",
 *          "city": "City",
 *          "country": "AR"
 *        }
 *      },
 *      "Orders": [
 *        {
 *          "id": 8,
 *          "delivered_at": null
 *        },
 *        {
 *          "id": 9,
 *          "delivered_at": null
 *        },
 *        {
 *          "id": 10,
 *          "delivered_at": null
 *        }
 *      ],
 *      "Stops": [],
 *      "DriversLocations": []
 *    }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 *
 * @apiErrorExample Not found:
 *     HTTP/1.1 404
 */
router.get('/:id', userHasSupplier, RoutesCtrl.get);

/**
 * @api {get} /api/routes List routes
 * @apiName List routes
 * @apiGroup Routes
 * @apiDescription Returns a list of routes where the tour's supplier matches the one
 * of the logged in user
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/routes?limit=10&offset=0
 *
 *    Returns a header `x-total-count` with the total number of records for pagination
 *
 * @apiSuccessExample Success-Response:
 *     [{
 *       id: 1,
 *       start_date: null,
 *       end_date: null,
 *       Tour: { id: 1, name: 'Tour: Mante - McClure' }
 *     }]
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 */
router.get('/', userHasSupplier, RoutesCtrl.list);

/**
 * @api {post} /api/routes Create route
 * @apiName Create route
 * @apiGroup Routes
 * @apiDescription Creates a new route for a specific Tour with a set of orders
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        order_ids: [1, 2, 3, 4],
 *        tour_id: 3,
 *     }
 *
 * @apiSuccessExample Success-Response:
 *    {
 *      "uuid": "75295540-c9ec-11eb-8fc8-c77b939c65e3",
 *      "id": 1,
 *      "tour_id": 1,
 *      "pathway": [
 *        {
 *          "latitude": 4.14001,
 *          "longitude": 11.000001,
 *          "id": 1,
 *          "tour_id": 1,
 *          "tour_position": 3,
 *          "name": "Lakin - King",
 *          "alias": "Zieme - Schultz",
 *          "street": "st",
 *          "street_number": "123123",
 *          "city": "City 2",
 *          "zipcode": "123",
 *          "country": "BR",
 *          "coordinates": {
 *            "type": "Point",
 *            "coordinates": [
 *              11.000001,
 *              4.14001
 *            ]
 *          },
 *          "email": "theodora.terry65@hotmail.com",
 *          "phone": "123321312312",
 *          "Orders": [
 *            {
 *              "id": 1,
 *              "supplier_id": 1,
 *              "customer_id": 1,
 *              "description": "This is the order description for Lakin - King",
 *              "number": "number"
 *            }
 *          ]
 *        }
 *      ],
 *      "code": "QWYXVY",
 *      "password": "2583"
 *    }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 *
 * @apiErrorExample Orders are invalid:
 *     HTTP/1.1 400
 *     { error: 'INVALID_ORDERS' }
 *
 * @apiErrorExample Tour is invalid:
 *     HTTP/1.1 400
 *     { error: 'INVALID_TOUR' }
 *
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *         order_ids: '"order_ids" is required',
 *         tour_id: '"tour_id" is required',
 *       }
 *     }
 */
router.post('/', userHasSupplier, RoutesCtrl.create);

/**
 * @api {delete} /api/routes/:id Delete route
 * @apiName Delete route
 * @apiGroup Routes
 * @apiDescription Deletes a route only if `start_date` is not set. When deleting a route
 * all the orders from that route are unlinked
 *
 * @apiParamExample {json} Request-Example:
 *    DELETE /api/routes/1
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 1
 *     }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 *
 * @apiErrorExample Route already started:
 *     HTTP/1.1 400
 *     { error: 'ROUTE_STARTED' }
 */
router.delete('/:id', userHasSupplier, RoutesCtrl.destroy);

export default router;
