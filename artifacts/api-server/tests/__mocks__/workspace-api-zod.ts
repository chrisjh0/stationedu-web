import { jest } from '@jest/globals';
import zod from 'zod';

export const HealthCheckResponse = {
  parse: jest.fn().mockImplementation((v: unknown) => v),
};

export const RequestUploadUrlBody = zod.object({
  name: zod.string(),
  size: zod.number().int(),
  contentType: zod.string(),
});

export const RequestUploadUrlResponse = zod.object({
  uploadURL: zod.string(),
  objectPath: zod.string(),
  metadata: zod.object({
    name: zod.string().optional(),
    size: zod.number().int().optional(),
    contentType: zod.string().optional(),
  }).optional(),
});
