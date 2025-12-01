import { describe, it, expect } from 'vitest';
import { HttpError } from '../../src/errors/interface/HttpError';

// Create a concrete implementation for testing
class TestHttpError extends HttpError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
  }
}

describe('HttpError', () => {
  it('should create an error with message and status code', () => {
    const error = new TestHttpError('Test error', 500);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
  });

  it('should have the correct name', () => {
    const error = new TestHttpError('Test error', 500);

    expect(error.name).toBe('Error');
  });

  it('should preserve stack trace', () => {
    const error = new TestHttpError('Test error', 500);

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('Test error');
  });
});
