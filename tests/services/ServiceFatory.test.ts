import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceFactory } from '../../src/services/ServiceFatory';
import { RepositoriesFactory } from '../../src/repositories/RepositoriesFactory';
import { AdaptersFactory } from '../../src/adapters/AdaptersFactory';

vi.mock('../../src/repositories/RepositoriesFactory', () => ({
  RepositoriesFactory: {
    createDeliveryRepository: vi.fn(),
  },
}));

vi.mock('../../src/adapters/AdaptersFactory', () => ({
  AdaptersFactory: {
    getPubSub: vi.fn(),
  },
}));

describe('ServiceFactory', () => {
  let mockRepository: any;
  let mockPubSub: any;

  beforeEach(() => {
    // Reset all static instances
    (ServiceFactory as any).createDeliverySessionInstance = undefined;
    (ServiceFactory as any).updateDeliveryInstructionInstance = undefined;
    (ServiceFactory as any).listDeliveriesInstance = undefined;
    (ServiceFactory as any).findDeliveryInstance = undefined;
    (ServiceFactory as any).updateDeliverySessionInstance = undefined;
    (ServiceFactory as any).resendDeliveryInstance = undefined;

    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      findInstructionById: vi.fn(),
      updateInstruction: vi.fn(),
    };

    mockPubSub = {
      connect: vi.fn(),
      publish: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn(),
    };

    vi.mocked(RepositoriesFactory.createDeliveryRepository).mockReturnValue(mockRepository);
    vi.mocked(AdaptersFactory.getPubSub).mockReturnValue(mockPubSub);
    vi.clearAllMocks();
  });

  describe('getCreateDeliverySession', () => {
    it('should return a CreateDeliverySession instance', () => {
      const result = ServiceFactory.getCreateDeliverySession();

      expect(result).toBeDefined();
      expect(result.execute).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const instance1 = ServiceFactory.getCreateDeliverySession();
      const instance2 = ServiceFactory.getCreateDeliverySession();

      expect(instance1).toBe(instance2);
    });

    it('should use RepositoriesFactory and AdaptersFactory', () => {
      ServiceFactory.getCreateDeliverySession();

      expect(RepositoriesFactory.createDeliveryRepository).toHaveBeenCalled();
      expect(AdaptersFactory.getPubSub).toHaveBeenCalled();
    });
  });

  describe('getUpdateDeliveryInstruction', () => {
    it('should return an UpdateDeliveryInstruction instance', () => {
      const result = ServiceFactory.getUpdateDeliveryInstruction();

      expect(result).toBeDefined();
      expect(result.execute).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const instance1 = ServiceFactory.getUpdateDeliveryInstruction();
      const instance2 = ServiceFactory.getUpdateDeliveryInstruction();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getListDeliveriesService', () => {
    it('should return a ListDeliveries instance', () => {
      const result = ServiceFactory.getListDeliveriesService();

      expect(result).toBeDefined();
      expect(result.execute).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const instance1 = ServiceFactory.getListDeliveriesService();
      const instance2 = ServiceFactory.getListDeliveriesService();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getFindDeliveryService', () => {
    it('should return a FindDelivery instance', () => {
      const result = ServiceFactory.getFindDeliveryService();

      expect(result).toBeDefined();
      expect(result.execute).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const instance1 = ServiceFactory.getFindDeliveryService();
      const instance2 = ServiceFactory.getFindDeliveryService();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getUpdateDeliverySession', () => {
    it('should return an UpdateDelivery instance', () => {
      const result = ServiceFactory.getUpdateDeliverySession();

      expect(result).toBeDefined();
      expect(result.execute).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const instance1 = ServiceFactory.getUpdateDeliverySession();
      const instance2 = ServiceFactory.getUpdateDeliverySession();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getResendDelivery', () => {
    it('should return a ResendDelivery instance', () => {
      const result = ServiceFactory.getResendDelivery();

      expect(result).toBeDefined();
      expect(result.execute).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const instance1 = ServiceFactory.getResendDelivery();
      const instance2 = ServiceFactory.getResendDelivery();

      expect(instance1).toBe(instance2);
    });

    it('should use RepositoriesFactory and AdaptersFactory', () => {
      ServiceFactory.getResendDelivery();

      expect(RepositoriesFactory.createDeliveryRepository).toHaveBeenCalled();
      expect(AdaptersFactory.getPubSub).toHaveBeenCalled();
    });
  });
});
