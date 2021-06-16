import { Router } from 'express';
import DriversCtrl from '../controllers/drivers';
import isDriverAuthenticated from '../middlewares/isDriverAuthenticated';

const router = Router();

/**
 * @api {post} /api/drivers/login Driver login
 * @apiName Driver login
 * @apiGroup Drivers
 * @apiDescription Logs a driver into the system by using a routes's code/password
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "code": "ABCD",
 *       "password": "1232",
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "token": "asd1231mw1w12wn1o2i312311d1123ef12fwdfd",
 *     }
 *
 * @apiErrorExample Invalid auth/route:
 *     HTTP/1.1 400
 *     {
 *       "error": "INVALID_AUTH_OR_ROUTE"
 *     }
 *
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *         "code": "'code' is required",
 *         "password": "'password' is required",
 *       }
 *     }
 */
router.post('/login', DriversCtrl.authenticate);

/**
 * @api {get} /api/drivers/route Get route
 * @apiName Get route
 * @apiGroup Drivers
 * @apiDescription Returns the full route related to the driver's session
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/drivers/route
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
 */
router.get('/route', isDriverAuthenticated, DriversCtrl.route);

/**
 * @api {put} /api/drivers/route/start Start route
 * @apiName Start route
 * @apiGroup Drivers
 * @apiDescription Marks a route as started, setting the `start_date` field
 *
 * @apiParamExample {json} Request-Example:
 *     PUT /api/drivers/route/start
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 1
 *     }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 */
router.put('/route/start', isDriverAuthenticated, DriversCtrl.startRoute);

/**
 * @api {put} /api/drivers/route/end End route
 * @apiName End route
 * @apiGroup Drivers
 * @apiDescription Marks a route as ended, setting the `end_date` field
 *
 * @apiParamExample {json} Request-Example:
 *     PUT /api/drivers/route/end
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 1
 *     }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 */
router.put('/route/end', isDriverAuthenticated, DriversCtrl.endRoute);

/**
 * @api {post} /api/drivers/route/stop Create stop
 * @apiName Create stop
 * @apiGroup Drivers
 * @apiDescription Creates a stop in the route
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        customer_id: 1,
 *        time: '2021-01-01T10:00:00',
 *        customer_signed: true,
 *        latitude: 10.2212312,
 *        longitude: 11.23123,
 *        meet_customer: true,
 *        reason: '',
 *        driver_name: 'Driver',
 *        goods_back: false,
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 1
 *     }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *          "customer_id": '"customer_id" is required',
 *          "time": '"time" is required',
 *          "customer_signed": '"customer_signed" is required',
 *          "latitude": '"latitude" is required',
 *          "longitude": '"longitude" is required',
 *          "meet_customer": '"meet_customer" is required',
 *          "reason": '"reason" is required',
 *          "driver_name": '"driver_name" is required',
 *          "goods_back": '"goods_back" is required',
 *       }
 *     }
 */
router.post('/route/stop', isDriverAuthenticated, DriversCtrl.createStop);

/**
 * @api {post} /api/drivers/route/location Track current location
 * @apiName Track current location
 * @apiGroup Drivers
 * @apiDescription Creates a location record to track the driver's location along the route
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        latitude: 10.002132,
 *        longitude: 9.123123,
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 1
 *     }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *          "latitude": '"latitude" is required',
 *          "longitude": '"longitude" is required',
 *       }
 *     }
 */
router.post('/route/location', isDriverAuthenticated, DriversCtrl.location);

export default router;
