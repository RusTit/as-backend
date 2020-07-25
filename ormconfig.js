const sourcePath = process.env.NODE_ENV === 'test' ? 'src' : 'dist';
module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://test:test@localhost/test',
  entities: [`${sourcePath}/**/*.entity{.ts,.js}`],
  migrations: [`${sourcePath}/migration/*.js`],
  cli: {
    migrationsDir: 'src/migration',
  },
  ssl: process.env.DATABASE_ENABLE_SSL
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
};
