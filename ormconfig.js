module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://test:test@localhost/test',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migration/*.js'],
  cli: {
    migrationsDir: 'src/migration',
  },
  ssl: process.env.DATABASE_ENABLE_SSL
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
};
