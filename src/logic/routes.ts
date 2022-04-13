import createError from 'http-errors';
import Sequelize from 'sequelize';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import randomString from 'randomstring';
import { DateTime } from 'luxon';
import models from '../models';
import S3Logic from './s3';
import RoutesCustomersOrdering from './routes-customers-ordering';

export default {
  archive: async () => {
    const routes = await models.Routes.findAll({
      where: {
        created_at: {
          [Sequelize.Op.not]: null,
          [Sequelize.Op.lte]: DateTime.now().minus({ days: 5 }).toISO(),
        },
        end_date: null,
      },
    });

    console.log('Found routes: ', routes.length);
    console.log(routes.map((r) => r.id).join(', '));

    for (let route of routes) {
      await route.update({
        end_date: route.start_date,
      }, {
        logging: console.log,
      });
    }
  },
  markOrdersAsDelivered: async (id: string | number, customer_id: number, stop: Stop): Promise<any> => {
    const route = await models.Routes.findOne({
      where: { id },
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
        goods_back: stop.goods_back ? true : false,
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
        }, {
          model: models.Suppliers,
          attributes: [
            'id',
            'name',
            'alias',
            'street',
            'street_number',
            'city',
            'zipcode',
            'country',
            'email',
            'phone',
          ],
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
  get: async (where: any, allDriverLocations = false): Promise<FullRoute> => {
    const route = await models.Routes.findOne({
      where,
      include: [{
        model: models.Tours,
        include: [{
          model: models.TransportAgents,
        }, {
          model: models.Suppliers,
          attributes: ['id', 'name', 'coordinates'],
        }],
      }],
    });

    if (!route) {
      throw createError(404, 'NOT_FOUND');
    }

    const orders = await models.Orders.findAll({
      where: {
        route_id: route.id,
      },
      attributes: ['id', 'delivered_at'],
      raw: true,
    });

    const stops = await models.Stops.findAll({
      where: {
        route_id: route.id,
      },
      raw: true,
    })

    const dl = await models.DriversLocations.findAll({
      where: {
        route_id: route.id,
      },
      limit: allDriverLocations ? 100000 : 1,
      order: [['id', 'DESC']],
      attributes: ['location', 'created_at'],
      raw: true,
    });

    const rn = await models.RoutesNavigations.findAll({
      where: {
        route_id: route.id,
      },
      attributes: ['customer_id', 'navigation', 'created_at'],
      raw: true,
    });

    const asJson: FullRoute = route.toJSON();

    return {
      ...asJson,
      DriversLocations: dl,
      RoutesNavigations: rn,
      Orders: orders,
      Stops: stops.map((stop) => {
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
    const supplier = await models.Suppliers.findOne({
      where: { id: user.supplier_id },
      raw: true,
    });
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

    const salesmanOrderedCustomers = await RoutesCustomersOrdering.solveWithMatrix({
      id: 0,
      name: 'Start',
      latitude: supplier.coordinates.coordinates[1],
      longitude: supplier.coordinates.coordinates[0],
    }, customers.map((c) => ({
      id: c.id,
      name: c.name,
      latitude: c.coordinates.coordinates[1],
      longitude: c.coordinates.coordinates[0],
    })));
    const orderedCustomersIds = salesmanOrderedCustomers.map((c) => c.id);

    const ordered: CustomerWithOrders[] = customers.sort((a, b) => {
      return orderedCustomersIds.indexOf(a.id) - orderedCustomersIds.indexOf(b.id);
    });

    const count = await models.Routes.count({
      where: {
        tour_id: body.tour_id,
        created_at: {
          [Sequelize.Op.gte]: DateTime.utc().startOf('day').toISO(),
          [Sequelize.Op.lte]: DateTime.utc().endOf('day').toISO(),
        },
      },
    });

    const route = await models.Routes.create({
      tour_id: body.tour_id,
      pathway: ordered,
      code: randomString.generate({ length: 4, charset: 'alphabetic', capitalization: 'uppercase' }),
      password: randomString.generate({ length: 4, charset: 'numeric' }),
      uuid: `${tour.id}.${count + 1}`,
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
