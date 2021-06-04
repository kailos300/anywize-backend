
import supertest from 'supertest';
import faker from 'faker';
import _ from 'lodash';
import getenv from 'getenv';
import models from '../models';
import * as UsersLogic from '../logic/users';

const PORT = getenv('PORT');

let adminUser;

export const request = supertest(`http://localhost:${PORT}`);

export const delay = (ms) => new Promise((resolve): void => {
  setTimeout(() => resolve(true), ms);
});

export const createUser = async (data = {}): Promise<{ user: User, token: string }> => {
  const user = await models.Users.create({
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: 'Testtest',
    ...data,
  });

  const json = user.toJSON();
  const token = UsersLogic.getJWT(json);

  return { user: json, token };
};

export default {
  request,
  delay,
  createUser,
};
