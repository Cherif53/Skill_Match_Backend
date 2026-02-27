export default () => ({
  nodeEnv: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.PORT ?? '3000', 10),

  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    name: process.env.POSTGRES_DB,
  },
});
