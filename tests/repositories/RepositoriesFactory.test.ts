import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepositoriesFactory } from '../../src/repositories/RepositoriesFactory';
import { PrismaDeliveryRepository } from '../../src/repositories/implementations/PrismaDeliveryRepository';

vi.mock('../../src/repositories/implementations/PrismaDeliveryRepository', () => ({
  PrismaDeliveryRepository: {
    getInstance: vi.fn(),
  },
}));

describe('RepositoriesFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDeliveryRepository', () => {
    it('should create and return a delivery repository', () => {
      const mockRepository = {} as any;
      vi.mocked(PrismaDeliveryRepository.getInstance).mockReturnValue(mockRepository);

      const result = RepositoriesFactory.createDeliveryRepository();

      expect(PrismaDeliveryRepository.getInstance).toHaveBeenCalled();
      expect(result).toBe(mockRepository);
    });
  });
});
