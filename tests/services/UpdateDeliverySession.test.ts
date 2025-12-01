import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateDelivery, UpdateDeliveryRequestSchema } from '../../src/services/UpdateDeliverySession';
import type { DeliveryRepository } from '../../src/repositories/DeliveryRepository';
import type { Delivery } from '@prisma/client';
import { NotFoundError } from '../../src/errors/NotFoundError';

describe('UpdateDelivery', () => {
  let deliveryRepository: DeliveryRepository;
  let updateDelivery: UpdateDelivery;

  beforeEach(() => {
    deliveryRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;
    updateDelivery = new UpdateDelivery(deliveryRepository);
  });

  describe('execute', () => {
    it('should update delivery with startTime', async () => {
      const mockDelivery: Delivery = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
      };

      const startTime = new Date('2024-01-01T10:00:00Z');
      const updatedDelivery: Delivery = {
        ...mockDelivery,
        startTime,
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery as any);
      vi.spyOn(deliveryRepository, 'update').mockResolvedValue(updatedDelivery);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDelivery.execute({
        deliveryId: 1,
        startTime,
      });

      expect(deliveryRepository.findById).toHaveBeenCalledWith(1);
      expect(deliveryRepository.update).toHaveBeenCalledWith({
        deliveryId: 1,
        startTime,
        endTime: undefined,
      });
      expect(result).toEqual(updatedDelivery);
      expect(console.info).toHaveBeenCalledWith(
        'Delivery with id:',
        1,
        'updated successfully.'
      );
    });

    it('should update delivery with endTime', async () => {
      const mockDelivery: Delivery = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
      };

      const endTime = new Date('2024-01-01T10:05:00Z');
      const updatedDelivery: Delivery = {
        ...mockDelivery,
        endTime,
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery as any);
      vi.spyOn(deliveryRepository, 'update').mockResolvedValue(updatedDelivery);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDelivery.execute({
        deliveryId: 1,
        endTime,
      });

      expect(deliveryRepository.update).toHaveBeenCalledWith({
        deliveryId: 1,
        startTime: undefined,
        endTime,
      });
      expect(result.endTime).toEqual(endTime);
    });

    it('should update delivery with both startTime and endTime', async () => {
      const mockDelivery: Delivery = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
      };

      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z');
      const updatedDelivery: Delivery = {
        ...mockDelivery,
        startTime,
        endTime,
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery as any);
      vi.spyOn(deliveryRepository, 'update').mockResolvedValue(updatedDelivery);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDelivery.execute({
        deliveryId: 1,
        startTime,
        endTime,
      });

      expect(deliveryRepository.update).toHaveBeenCalledWith({
        deliveryId: 1,
        startTime,
        endTime,
      });
      expect(result).toEqual(updatedDelivery);
    });

    it('should update delivery with null startTime', async () => {
      const mockDelivery: Delivery = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: new Date(),
        endTime: null,
      };

      const updatedDelivery: Delivery = {
        ...mockDelivery,
        startTime: null,
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery as any);
      vi.spyOn(deliveryRepository, 'update').mockResolvedValue(updatedDelivery);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDelivery.execute({
        deliveryId: 1,
        startTime: null,
      });

      expect(result.startTime).toBeNull();
    });

    it('should update delivery with null endTime', async () => {
      const mockDelivery: Delivery = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: new Date(),
      };

      const updatedDelivery: Delivery = {
        ...mockDelivery,
        endTime: null,
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery as any);
      vi.spyOn(deliveryRepository, 'update').mockResolvedValue(updatedDelivery);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDelivery.execute({
        deliveryId: 1,
        endTime: null,
      });

      expect(result.endTime).toBeNull();
    });

    it('should throw NotFoundError when delivery does not exist', async () => {
      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(null);

      await expect(
        updateDelivery.execute({
          deliveryId: 999,
          startTime: new Date(),
        })
      ).rejects.toThrow(NotFoundError);

      await expect(
        updateDelivery.execute({
          deliveryId: 999,
          startTime: new Date(),
        })
      ).rejects.toThrow(' with ID 999 not found.');
    });

    it('should not call update when delivery not found', async () => {
      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(null);
      vi.spyOn(deliveryRepository, 'update').mockResolvedValue({} as any);

      await expect(
        updateDelivery.execute({
          deliveryId: 999,
          startTime: new Date(),
        })
      ).rejects.toThrow();

      expect(deliveryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error for invalid deliveryId (negative)', async () => {
      await expect(
        updateDelivery.execute({
          deliveryId: -1,
          startTime: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should throw error for invalid deliveryId (zero)', async () => {
      await expect(
        updateDelivery.execute({
          deliveryId: 0,
          startTime: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should throw error for non-integer deliveryId', async () => {
      await expect(
        updateDelivery.execute({
          deliveryId: 1.5,
          startTime: new Date(),
        } as any)
      ).rejects.toThrow();
    });
  });

  describe('UpdateDeliveryRequestSchema', () => {
    it('should validate valid request with deliveryId only', () => {
      const result = UpdateDeliveryRequestSchema.parse({
        deliveryId: 1,
      });
      expect(result.deliveryId).toBe(1);
    });

    it('should validate valid request with startTime', () => {
      const startTime = new Date();
      const result = UpdateDeliveryRequestSchema.parse({
        deliveryId: 1,
        startTime,
      });
      expect(result).toEqual({ deliveryId: 1, startTime });
    });

    it('should validate valid request with endTime', () => {
      const endTime = new Date();
      const result = UpdateDeliveryRequestSchema.parse({
        deliveryId: 1,
        endTime,
      });
      expect(result).toEqual({ deliveryId: 1, endTime });
    });

    it('should validate valid request with null startTime', () => {
      const result = UpdateDeliveryRequestSchema.parse({
        deliveryId: 1,
        startTime: null,
      });
      expect(result.startTime).toBeNull();
    });

    it('should validate valid request with null endTime', () => {
      const result = UpdateDeliveryRequestSchema.parse({
        deliveryId: 1,
        endTime: null,
      });
      expect(result.endTime).toBeNull();
    });

    it('should reject negative deliveryId', () => {
      expect(() =>
        UpdateDeliveryRequestSchema.parse({
          deliveryId: -1,
        })
      ).toThrow();
    });

    it('should reject zero deliveryId', () => {
      expect(() =>
        UpdateDeliveryRequestSchema.parse({
          deliveryId: 0,
        })
      ).toThrow();
    });

    it('should reject missing deliveryId', () => {
      expect(() =>
        UpdateDeliveryRequestSchema.parse({
          startTime: new Date(),
        })
      ).toThrow();
    });

    it('should reject non-integer deliveryId', () => {
      expect(() =>
        UpdateDeliveryRequestSchema.parse({
          deliveryId: 1.5,
        })
      ).toThrow();
    });
  });
});
