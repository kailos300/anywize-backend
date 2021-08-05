import createError from 'http-errors';
import orderBy from 'lodash/orderBy';
import randomString from 'randomstring';
import { DateTime } from 'luxon';
import models from '../models';
import S3Logic from './s3';

export default {
  markOrdersAsDelivered: async (uuid: string, customer_id: number): Promise<any> => {
    const route = await models.Routes.findOne({
      where: { uuid },
      attributes: ['id', 'start_date', 'end_date', 'pathway'],
    });

    const { pathway } = route;

    const index = pathway.findIndex((p) => p.id === customer_id);
    const now = DateTime.now().toISO();

    if (index === -1) {
      throw new Error('CUSTOMER_NOT_FOUND_IN_ROUTE');
    }

    const orders = pathway[index].Orders;
    const ids = orders.map((o) => o.id);

    await models.Orders.update({
      delivered_at: now,
    }, {
      where: { id: ids },
    });

    const newPathway = [
      ...pathway.slice(0, index),
      {
        ...pathway[index],
        Orders: pathway[index].Orders.map((o) => ({
          ...o,
          delivered_at: now,
        })),
      },
      ...pathway.slice(index + 1),
    ];

    await route.update({ pathway: newPathway });
  },
  getRouteForDriver: async (where: any): Promise<RouteForDriver> => {
    const record = await models.Routes.findOne({
      where,
      include: [{
        model: models.Tours,
        attributes: ['id', 'supplier_id', 'name', 'description'],
        include: [{
          model: models.TransportAgents,
          attributes: ['id', 'alias', 'name'],
        }],
      }, {
        model: models.Stops,
        required: false,
      }],
    });


    const route: FullRoute = record.toJSON();
    const { pathway, Stops, ...rest } = route;
    const visitedCustomersIds = Stops.map((s) => s.customer_id);
    const [filteredPathway] = route.pathway.filter((path) => {
      return !visitedCustomersIds.includes(path.id);
    });

    const current_pathway_index = filteredPathway
      ? pathway.findIndex((p) => p.id === filteredPathway.id)
      : null;

    return {
      ...rest,
      pathway: filteredPathway ? pathway : null,
      current_pathway_index,
    };
  },
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
      }, {
        model: models.RoutesNavigations,
        attributes: ['customer_id', 'navigation', 'created_at'],
        required: false,
      }],
    });

    if (!route) {
      throw createError(404, 'NOT_FOUND');
    }

    const asJson: FullRoute = route.toJSON();

    return {
      ...asJson,
      Stops: asJson.Stops.map((stop) => {
        return {
          ...stop,
          signature_file: stop.signature_file ? S3Logic.getSignedUrl(stop.signature_file) : null,
          pictures: stop.pictures.map((p) => S3Logic.getSignedUrl(p)),
        };
      }),
    };
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
          exclude: ['route_id'],
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
