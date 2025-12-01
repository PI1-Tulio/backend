import { describe, it, expect } from 'vitest';
import { BadRequestError } from '../../src/errors/BadRequestError';
import { HttpError } from '../../src/errors/interface/HttpError';

describe('BadRequestError', () => {
  it('should create a BadRequestError with correct message and status code', () => {
    const error = new BadRequestError('Invalid request');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe('Invalid request');
    expect(error.statusCode).toBe(400);
  });

  it('should handle different error messages', () => {
    const error1 = new BadRequestError('Missing required field');
    const error2 = new BadRequestError('Invalid format');

    expect(error1.message).toBe('Missing required field');
    expect(error2.message).toBe('Invalid format');
    expect(error1.statusCode).toBe(400);
    expect(error2.statusCode).toBe(400);
  });
});
