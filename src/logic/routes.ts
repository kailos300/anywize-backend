import createError from 'http-errors';
import orderBy from 'lodash/orderBy';
import randomString from 'randomstring';
import models from '../models';


export default {
  get: async (where: any): Promise<FullRoute> => {
    const route = await models.Routes.findOne({
      where,
      include: [{
        model: models.Tours,
        include: [{
          model: models.TransportAgents,
        }],
      }, {
        model: models.Orders,
        required: false,
        attributes: ['id', 'delivered_at'],
      }, {
        model: models.Stops,
        required: false,
      }, {
        model: models.DriversLocations,
        attributes: ['location', 'created_at'],
        required: false,
      }],
    });

    if (!route) {
      throw createError(404, 'NOT_FOUND');
    }

    return route.toJSON();
  },
  unlinkOrders: async (route: Route): Promise<void> => {
    await models.Orders.update({
      route_id: null,
    }, {
      where: { route_id: route.id },
    });
  },
  create: async (body: { order_ids: number[], tour_id: number }, user: User): Promise<Route> => {
    const customers = await models.Customers.findAll({
      where: {
        tour_id: body.tour_id,
        supplier_id: user.supplier_id,
        active: true,
      },
      attributes: {
        exclude: ['active', 'created_at', 'updated_at', 'sms_notifications', 'email_notifications', 'supplier_id'],
      },
      include: [{
        model: models.Orders,
        where: {
          id: body.order_ids,
          route_id: null,
        },
        required: true,
        attributes: {
          exclude: ['route_id', 'delivered_at'],
        },
      }],
    });

    if (!customers.length) {
      throw createError(400, 'INVALID_ORDERS');
    }

    const tour: Tour = await models.Tours.findOne({
      where: {
        id: body.tour_id,
        supplier_id: user.supplier_id,
      },
      raw: true,
    });

    if (!tour) {
      throw createError(400, 'INVALID_TOUR');
    }

    const ordered: CustomerWithOrders[] = orderBy(customers, ['tour_position'], ['asc']).map((o) => o.toJSON());
    const route = await models.Routes.create({
      tour_id: body.tour_id,
      pathway: ordered,
      code: randomString.generate({ length: 4, charset: 'alphabetic', capitalization: 'uppercase' }),
      password: randomString.generate({ length: 4, charset: 'numeric' }),
    });

    await models.Orders.update({
      route_id: route.id,
    }, {
      where: {
        id: ordered.reduce((acc, cur) => {
          return acc.concat(cur.Orders.map(o => o.id));
        }, []),
      },
    });

    return route;
  },
};
