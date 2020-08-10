export default {
  log4js: {
    appenders: {
      console: {
        type: 'stdout',
      },
    },
    categories: {
      default: {
        appenders: ['console'],
        level: 'debug',
      },
    },
  },
  Cron: {
    Schedule: '0 0 * * * *',
    Timezone: 'America/New_York',
  },
};
