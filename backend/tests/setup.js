import { jest, beforeAll, afterAll } from '@jest/globals';

// Set test environment variables prior to any imports
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog_app_test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_jwt_access_secret_32_characters_long_min!';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_jwt_refresh_secret_32_characters_long_min!';
process.env.FRONTEND_URL = 'http://localhost:3000';

beforeAll(() => {
  // Silent logs during test runs
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});
