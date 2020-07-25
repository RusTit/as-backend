module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://test:test@localhost/test',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['migration/*{.ts,.js}'],
  cli: {
    migrationsDir: 'migration',
  },
};
