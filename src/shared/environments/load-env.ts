import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  server: {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbDatabase: process.env.DB_DATABASE,
    mongoUri: process.env.MONGO_URI,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisUsername: process.env.REDIS_USERNAME,
    redisPassword: process.env.REDIS_PASSWORD,
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    msLogs: process.env.MS_LOGS,
    msEmail: process.env.MS_EMAIL,
    cryptoKey: process.env.CRYPTO_KEY,
  },
};
