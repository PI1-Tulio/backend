import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseConnetion } from '../../../src/infra/database/DatabaseConnection';

vi.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() { }
  },
}));

vi.mock('@prisma/adapter-better-sqlite3', () => ({
  PrismaBetterSqlite3: class MockAdapter {
    constructor() { }
  },
}));

vi.mock('../../../src/config/env', () => ({
  env: {
    DATABASE_URL: 'file:./test.db',
  },
}));

describe('DatabaseConnetion', () => {
  beforeEach(() => {
    // Reset the static connection
    (DatabaseConnetion as any).CONNECTION = null;
    vi.clearAllMocks();
  });

  describe('getConnection', () => {
    it('should return a PrismaClient instance', () => {
      const result = DatabaseConnetion.getConnection();

      expect(result).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const instance1 = DatabaseConnetion.getConnection();
      const instance2 = DatabaseConnetion.getConnection();

      expect(instance1).toBe(instance2);
    });
  });
});
