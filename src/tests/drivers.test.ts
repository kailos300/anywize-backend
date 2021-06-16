import 'mocha';
import { expect } from 'chai';
import Helper from './_helper';
import models from '../models';
import { DateTime } from 'luxon';

const { request } = Helper;

describe('Drivers tests', () => {
  let supplier: Supplier;

  before(async () => {
    supplier = await Helper.createSupplier();
  });

  it('/api/drivers/* should return 401 if not logged in', async () => {
    let res = await request.get('/api/drivers/route');
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route/start');
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route/end');
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/stop');
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/location');
    expect(res.status).equal(401);
  });

  it('/api/drivers/* should return 401 if using a regular auth token', async () => {
    const { token } = await Helper.createUser();

    let res = await request.get('/api/drivers/route').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route/start').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route/end').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/stop').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/location').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);
  });

  it('POST /api/drivers/login should login using code/password from a route', async () => {
    const { user } = await Helper.createUser({ supplier_id: supplier.id });
    const { route } = await Helper.createRoute(user, supplier, [1, 3]);
    const { code, password } = route;

    let res = await request
      .post('/api/drivers/login')
      .send({});

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      code: '"code" is required',
      password: '"password" is required',
    });

    res = await request
      .post('/api/drivers/login')
      .send({
        code: 'n',
        password: 'mm',
      });

    expect(res.status).equal(400);
    expect(res.body.error).equal('INVALID_AUTH_OR_ROUTE');

    res = await request
      .post('/api/drivers/login')
      .send({ code, password });

    expect(res.status).equal(200);
    expect(res.body.token).to.be.a('string');

    await models.Routes.update({
      start_date: new Date(),
      end_date: new Date(),
    }, {
      where: { id: route.id },
    });

    // route that ended should no longer allow login
    res = await request
      .post('/api/drivers/login')
      .send({ code, password });

    expect(res.status).equal(400);
    expect(res.body.error).equal('INVALID_AUTH_OR_ROUTE');
  });

  it('GET /api/drivers/route should return a route', async () => {
    const { user } = await Helper.createUser({ supplier_id: supplier.id });
    const {
      route,
      token,
      customers,
      tour: newTour,
      transportAgent: newTransportAgent,
    } = await Helper.createRoute(user, supplier, [3]);

    const res = await request
      .get('/api/drivers/route')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway).eql({
      latitude: customers[0].customer.coordinates.coordinates[1],
      longitude: customers[0].customer.coordinates.coordinates[0],
      id: customers[0].customer.id,
      tour_id: customers[0].customer.tour_id,
      tour_position: customers[0].customer.tour_position,
      name: customers[0].customer.name,
      alias: customers[0].customer.alias,
      street: customers[0].customer.street,
      street_number: customers[0].customer.street_number,
      city: customers[0].customer.city,
      zipcode: customers[0].customer.zipcode,
      country: customers[0].customer.country,
      coordinates: customers[0].customer.coordinates,
      email: customers[0].customer.email,
      phone: customers[0].customer.phone,
      Orders: [
        {
          id: customers[0].orders[0].id,
          supplier_id: customers[0].orders[0].supplier_id,
          customer_id: customers[0].orders[0].customer_id,
          description: customers[0].orders[0].description,
          number: customers[0].orders[0].number,
          delivered_at: null,
        },
        {
          id: customers[0].orders[1].id,
          supplier_id: customers[0].orders[1].supplier_id,
          customer_id: customers[0].orders[1].customer_id,
          description: customers[0].orders[1].description,
          number: customers[0].orders[1].number,
          delivered_at: null,
        },
        {
          id: customers[0].orders[2].id,
          supplier_id: customers[0].orders[2].supplier_id,
          customer_id: customers[0].orders[2].customer_id,
          description: customers[0].orders[2].description,
          number: customers[0].orders[2].number,
          delivered_at: null,
        },
      ],
    });
    expect(res.body.id).equal(route.id);
    expect(res.body.Tour.id).equal(newTour.id);
    expect(res.body.Tour.TransportAgent.id).equal(newTransportAgent.id);
  });

  it('PUT /api/drivers/route/start should mark a route as started', async () => {
    const { user } = await Helper.createUser({ supplier_id: supplier.id });
    const {
      route,
      token,
    } = await Helper.createRoute(user, supplier, [3]);

    let res = await request
      .put('/api/drivers/route/start')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);

    const v1 = await models.Routes.findByPk(route.id);
    expect(v1.start_date).not.to.be.equal(null);

    // second request should matter
    res = await request
      .put('/api/drivers/route/start')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    const v2 = await models.Routes.findByPk(route.id);
    expect(DateTime.fromISO(v2.start_date).toFormat('DDDD')).equal(DateTime.fromISO(v1.start_date).toFormat('DDDD'));
  });

  it('PUT /api/drivers/route/end should mark a route as ended', async () => {
    const { user } = await Helper.createUser({ supplier_id: supplier.id });
    const {
      route,
      token,
    } = await Helper.createRoute(user, supplier, [3]);

    let res = await request
      .put('/api/drivers/route/end')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(404);

    await models.Routes.update({
      start_date: new Date(),
    }, {
      where: { id: route.id },
    });

    res = await request
      .put('/api/drivers/route/end')
      .set('Authorization', `Bearer ${token}`);

    const v1 = await models.Routes.findByPk(route.id);
    expect(v1.end_date).not.to.be.equal(null);

    // second request should fail
    res = await request
      .put('/api/drivers/route/start')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(401);
  });

  it('POST /api/drivers/route/stop should create a stop, mark the route section as started and return the next pathway', async () => {
    const { user } = await Helper.createUser({ supplier_id: supplier.id });
    const {
      route,
      token,
      customers,
    } = await Helper.createRoute(user, supplier, [3, 1, 1]);

    let res = await request
      .put('/api/drivers/route/start')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);

    res = await request
      .get('/api/drivers/route')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(200);
    expect(res.body.pathway.id).equal(customers[0].customer.id);

    res = await request
      .post('/api/drivers/route/stop')
      .send({
        customer_id: customers[0].customer.id,
        time: (new Date()).toISOString(),
        customer_signed: true,
        latitude: 10,
        longitude: 11,
        meet_customer: true,
        reason: null,
        driver_name: 'John',
        goods_back: false,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway.id).equal(customers[1].customer.id);
    expect(res.body.pathway.Orders.length).equal(1);

    // orders from the first customer should be delivered
    let orders = await models.Orders.findAll({
      where: {
        customer_id: customers[0].customer.id,
      },
      raw: true,
    });
    expect(orders.length).equal(3);
    orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));

    let dbRoute = await models.Routes.findByPk(route.id);
    expect(dbRoute.pathway[0].id).equal(customers[0].customer.id);
    dbRoute.pathway[0].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[1].Orders.forEach((o) => expect(o.delivered_at).equal(null));
    dbRoute.pathway[2].Orders.forEach((o) => expect(o.delivered_at).equal(null));

    // second stop
    res = await request
      .post('/api/drivers/route/stop')
      .send({
        customer_id: customers[1].customer.id,
        time: (new Date()).toISOString(),
        customer_signed: true,
        latitude: 10,
        longitude: 11,
        meet_customer: true,
        reason: null,
        driver_name: 'John',
        goods_back: false,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway.id).equal(customers[2].customer.id);
    expect(res.body.pathway.Orders.length).equal(1);

    // orders from the second customer should be delivered
    orders = await models.Orders.findAll({
      where: {
        customer_id: customers[1].customer.id,
      },
      raw: true,
    });
    expect(orders.length).equal(1);
    orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));

    dbRoute = await models.Routes.findByPk(route.id);
    expect(dbRoute.pathway[0].id).equal(customers[0].customer.id);
    dbRoute.pathway[0].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[1].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[2].Orders.forEach((o) => expect(o.delivered_at).equal(null));

    // third stop
    res = await request
      .post('/api/drivers/route/stop')
      .send({
        customer_id: customers[2].customer.id,
        time: (new Date()).toISOString(),
        customer_signed: true,
        latitude: 10,
        longitude: 11,
        meet_customer: true,
        reason: null,
        driver_name: 'John',
        goods_back: false,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway).equal(null);

    // orders from the third customer should be delivered
    orders = await models.Orders.findAll({
      where: {
        customer_id: customers[2].customer.id,
      },
      raw: true,
    });
    expect(orders.length).equal(1);
    orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));

    dbRoute = await models.Routes.findByPk(route.id);
    expect(dbRoute.pathway[0].id).equal(customers[0].customer.id);
    dbRoute.pathway[0].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[1].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[2].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
  });
});
