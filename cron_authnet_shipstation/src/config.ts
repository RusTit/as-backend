import { Configuration } from 'log4js';

export default {
  log4js: {
    appenders: {
      console: {
        type: 'stdout',
      },
      filelog: {
        type: 'dateFile',
        filename: 'logs/all-the-logs.log',
        compress: true,
      },
    },
    categories: {
      default: {
        appenders: ['console'],
        level: 'debug',
      },
    },
  } as Configuration,
  Cron: {
    Schedule: '0 0 * * * *',
    Timezone: 'America/New_York',
  },
};
