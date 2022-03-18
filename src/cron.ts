const CronJob = require('cron').CronJob;
const { DateTime } = require('luxon');
const Sequelize = require('sequelize');
const models = require('./models').default;

const EVERY_SATURDAY = '0 0 0 * * 6';
const EVERY_30_SECONDS = '0 */2 * * * *';

const job = new CronJob(EVERY_SATURDAY, async function() {
  console.log('Running cron job');

  const routes = await models.Routes.findAll({
    where: {
      start_date: {
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

}, null, true, 'UTC');

job.start();
