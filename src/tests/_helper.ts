
import supertest from 'supertest';
import faker from 'faker';
import _ from 'lodash';
import getenv from 'getenv';
import models from '../models';
import * as UsersLogic from '../logic/users';
import RoutesLogic from '../logic/routes';

const PORT = getenv('PORT');

let adminUser;
let supplier;
let transportAgent;

export const request = supertest(`http://localhost:${PORT}`);

export const delay = (ms) => new Promise((resolve): void => {
  setTimeout(() => resolve(true), ms);
});

export const createSupplier = async (forceNew = false, data = {}): Promise<Supplier> => {
  if (!forceNew && supplier) {
    return supplier;
  }

  const created = await models.Suppliers.create({
    name: `Name - ${faker.company.companyName()}`,
    alias: `Alias - ${faker.company.companyName()}`,
    street: 'street',
    street_number: '123123',
    city: 'City',
    zipcode: '123',
    country: 'AR',
    email: faker.internet.email().toLowerCase(),
    phone: '123123123',
    number: '0000',
    active: true,
    ...data,
  });

  if (forceNew) {
    return created.toJSON();
  }

  supplier = created.toJSON();

  return supplier;
};

export const setUserSupplier = async (user, supplier): Promise<void> => {
  await models.Users.update({
    supplier_id: supplier.id,
  }, {
    where: {
      id: user.id,
    },
  });
};

export const createUser = async (data = {}): Promise<{ user: User, token: string }> => {
  const user = await models.Users.create({
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: 'testtest',
    ...data,
  });

  const json = user.toJSON();
  const token = UsersLogic.getJWT(json);

  return { user: json, token };
};

export const createTransportAgent = async (data = {}): Promise<TransportAgent> => {
  if (transportAgent) {
    return transportAgent;
  }

  const created = await models.TransportAgents.create({
    name: `Name - ${faker.company.companyName()}`,
    alias: `Alias - ${faker.company.companyName()}`,
    street: 'street',
    street_number: '123123',
    city: 'City',
    country: 'AR',
  });

  transportAgent = created.toJSON();

  return transportAgent;
};

export const createTour = async (supplier: Supplier, transportAgent: TransportAgent): Promise<Tour> => {
  const created = await models.Tours.create({
    supplier_id: supplier.id,
    transport_agent_id: transportAgent.id,
    name: `Tour: ${faker.company.companyName()}`,
    description: 'this is the tour 1',
    number: '0000',
    active: true,
  });

  return created.toJSON();
};

export const createCustomer = async (supplier: Supplier, tour: Tour, data = {}): Promise<Customer> => {
  const created = await models.Customers.create({
    supplier_id: supplier.id,
    tour_id: tour.id,
    tour_position: 1,
    name: faker.company.companyName(),
    alias: faker.company.companyName(),
    street: 'st',
    street_number: '123123',
    city: 'City 2',
    zipcode: '123',
    country: 'BR',
    contact_salutation: 'MR',
    contact_name: 'John',
    contact_surname: 'Doe',
    email: faker.internet.email().toLowerCase(),
    phone: '123321312312',
    sms_notifications: false,
    email_notifications: false,
    active: true,
    coordinates: {
      type: 'Point',
      coordinates: [11.000001, 4.14001],
    },
    ...data,
  });

  return created.toJSON();
};

export const createOrder = async (supplier: Supplier, customer: Customer, data = {}): Promise<Order> => {
  const created = await models.Orders.create({
    customer_id: customer.id,
    supplier_id: supplier.id,
    description: 'This is the order description for ' + customer.name,
    number: '0000',
    ...data,
  });

  return created.toJSON();
};

export const createRoute = async (
  user: User, supplier: Supplier, _customers: number[]
): Promise<{
  route: Route;
  transportAgent: TransportAgent;
  tour: Tour;
  customers: { customer: Customer; orders: Order[] }[];
  token: string;
}> => {
  const transportAgent = await createTransportAgent();
  const tour = await createTour(supplier, transportAgent);
  const order_ids = [];
  const customers = await Promise.all(
    _customers.map(async (numberOfOrders, ii) => {
      const customer = await createCustomer(supplier, tour, { tour_position: ii });
      let i = 0;
      let orders = [];

      while (i < numberOfOrders) {
        const order = await createOrder(supplier, customer);

        orders.push(order);
        order_ids.push(order.id);

        i += 1;
      }

      return { customer, orders };
    })
  );

  const route = await RoutesLogic.create({ order_ids, tour_id: tour.id }, user);
  const token = UsersLogic.getDriverJWT(route);

  await models.Routes.update({ active_driver_jwt: token }, {
    where: { id: route.id },
  });

  return {
    route,
    transportAgent,
    tour,
    customers,
    token,
  };
};

export default {
  request,
  delay,
  createUser,
  createSupplier,
  setUserSupplier,
  createTransportAgent,
  createTour,
  createCustomer,
  createOrder,
  createRoute,
};
