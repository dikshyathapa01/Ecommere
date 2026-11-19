export default () => ({
  port: parseInt(process.env.PORT as string) || 3000,
  database: {
    dbType: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT as string) || 2061,
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    databaseName: process.env.DB_DATABASE || 'app_db',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'cloud_name',
    apiKey: process.env.CLOUDINARY_API_KEY || 'api_key',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'api_secret',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'Secret',
    expireIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  esewa: {
    merchantCode: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST',
    secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
    baseUrl:
      process.env.ESEWA_BASE_URL ||
      'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    callbackBaseUrl:
      process.env.ESEWA_CALLBACK_BASE_URL || 'http://localhost:3000',
  },
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY || '',
    baseUrl: process.env.KHALTI_BASE_URL || 'https://khalti.com/api/v2',
    callbackBaseUrl:
      process.env.KHALTI_CALLBACK_BASE_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:5173',
  },
});
