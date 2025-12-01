import { describe, it, expect } from 'vitest';
import { NotFoundError } from '../../src/errors/NotFoundError';
import { HttpError } from '../../src/errors/interface/HttpError';

describe('NotFoundError', () => {
  it('should create a NotFoundError with correct message and status code', () => {
    const error = new NotFoundError('Resource not found');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });

  it('should handle different error messages', () => {
    const error1 = new NotFoundError('User not found');
    const error2 = new NotFoundError('Delivery not found');

    expect(error1.message).toBe('User not found');
    expect(error2.message).toBe('Delivery not found');
    expect(error1.statusCode).toBe(404);
    expect(error2.statusCode).toBe(404);
  });
});
