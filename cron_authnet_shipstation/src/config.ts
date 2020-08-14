import { Configuration } from 'log4js';

export default {
  log4js: {
    appenders: {
      console: {
        type: 'stdout',
      },
      filelog: { type: 'dateFile', filename: 'all-the-logs.log' },
    },
    categories: {
      default: {
        appenders: ['console', 'filelog'],
        level: 'debug',
      },
    },
  } as Configuration,
  Cron: {
    Schedule: '0 0 * * * *',
    Timezone: 'America/New_York',
  },
};
