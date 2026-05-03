import { jest } from '@jest/globals';

export const HealthCheckResponse = {
  parse: jest.fn().mockImplementation((v: unknown) => v),
};
