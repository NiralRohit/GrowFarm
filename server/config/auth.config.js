module.exports = {
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "growfarm_access_secret_key_2026",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "growfarm_refresh_secret_key_2026",
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  
  // Weather API
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '6d8c0b5f543949f503c15c5e88888888', // Placeholder
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true' || false,
  OTP_EXPIRY_MINS: 5,
  MAX_OTP_ATTEMPTS: 3
};
