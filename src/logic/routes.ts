import createError from 'http-errors';
import orderBy from 'lodash/orderBy';
import cryptoRandomString from 'crypto-random-string';
import models from '../models';

type CustomerWithOrders = Omit<
  Customer, 'active' | 'created_at' | 'updated_at' | 'sms_notifications' | 'email_notifications' | 'supplier_id'
> & {
  Orders: Order[];
};

export default {
  create: async (body: { order_ids: number[], tour_id: number }, user: User): Promise<any> => {
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
        },
        required: true,
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
      code: cryptoRandomString({ length: 6, type: 'distinguishable' }),
      password: cryptoRandomString({ length: 4, type: 'numeric' }),
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
