export const appConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
  azureAdAudience: process.env.AZURE_AD_AUDIENCE,
  azureAdTenantId: process.env.AZURE_AD_TENANTID,
  urlDatabase: process.env.DATABASE_URL,
  secretJwt: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresInJwt: (process.env.JWT_EXPIRES_IN || '7d') as `${number}d` | `${number}h` | `${number}m`,
  refreshExpiresInJwt: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as
    | `${number}d`
    | `${number}h`
    | `${number}m`,
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  urlFrontend: process.env.FRONTEND_URL || 'http://localhost:3000',
  urlBackend: process.env.BACKEND_URL || 'http://localhost:3001',
};
