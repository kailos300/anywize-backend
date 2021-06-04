/// <reference path="./index.d.ts" />
import getenv from 'getenv';
import app from './app';

const PORT = getenv('PORT');
const NODE_ENV = getenv('NODE_ENV');

app.listen(PORT, () => console.log(`Starting App (${NODE_ENV}) -- listening on port ${PORT} `));
