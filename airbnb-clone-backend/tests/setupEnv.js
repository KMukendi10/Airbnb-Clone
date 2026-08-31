// Runs before the test framework is installed, so env vars are in place
// before app.js / controllers / middleware are ever required.
process.env.JWT_SECRET = 'test-jwt-secret-do-not-use-in-production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_ORIGINS = 'http://localhost:5173';
process.env.NODE_ENV = 'test';
