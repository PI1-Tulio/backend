import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FindDelivery, FindDeliveryRequestSchema } from '../../src/services/FindDelivery';
import type { DeliveryRepository, DeliveryWithInstructions } from '../../src/repositories/DeliveryRepository';
import { NotFoundError } from '../../src/errors/NotFoundError';
import type { Instruction } from '@prisma/client';

describe('FindDelivery', () => {
  let deliveryRepository: DeliveryRepository;
  let findDelivery: FindDelivery;

  beforeEach(() => {
    deliveryRepository = {
      findById: vi.fn(),
    } as any;
    findDelivery = new FindDelivery(deliveryRepository);
  });

  describe('execute', () => {
    it('should find a delivery by id with instructions', async () => {
      const mockInstructions: Instruction[] = [
        {
          id: 1,
          action: 'MOVE',
          value: 100,
          actuallyExecuted: 0,
          startTime: null,
          endTime: null,
          deliveryId: 1,
        },
        {
          id: 2,
          action: 'TURN',
          value: 1,
          actuallyExecuted: 0,
          startTime: null,
          endTime: null,
          deliveryId: 1,
        },
      ];

      const mockDelivery: DeliveryWithInstructions = {
        id: 1,
        name: 'Delivery 1',
        potL: 100,
        potR: 100,
        startTime: null,
        endTime: null,
        instructions: mockInstructions,
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery);

      const result = await findDelivery.execute({ deliveryId: 1 });

      expect(deliveryRepository.findById).toHaveBeenCalledWith(1, 'instructions');
      expect(result).toEqual(mockDelivery);
      expect(result.instructions).toHaveLength(2);
    });

    it('should throw NotFoundError when delivery does not exist', async () => {
      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(null);

      await expect(
        findDelivery.execute({ deliveryId: 999 })
      ).rejects.toThrow(NotFoundError);

      await expect(
        findDelivery.execute({ deliveryId: 999 })
      ).rejects.toThrow('Delivery with ID 999 not found.');
    });

    it('should throw error for invalid delivery id (negative)', async () => {
      await expect(
        findDelivery.execute({ deliveryId: -1 })
      ).rejects.toThrow();
    });

    it('should throw error for invalid delivery id (zero)', async () => {
      await expect(
        findDelivery.execute({ deliveryId: 0 })
      ).rejects.toThrow();
    });

    it('should throw error for non-integer delivery id', async () => {
      await expect(
        findDelivery.execute({ deliveryId: 1.5 } as any)
      ).rejects.toThrow();
    });

    it('should find delivery with empty instructions array', async () => {
      const mockDelivery: DeliveryWithInstructions = {
        id: 1,
        name: 'Delivery 1',
        potL: 100,
        potR: 100,
        startTime: null,
        endTime: null,
        instructions: [],
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery);

      const result = await findDelivery.execute({ deliveryId: 1 });

      expect(result.instructions).toEqual([]);
    });
  });

  describe('FindDeliveryRequestSchema', () => {
    it('should validate valid delivery id', () => {
      const result = FindDeliveryRequestSchema.parse({ deliveryId: 1 });
      expect(result).toEqual({ deliveryId: 1 });
    });

    it('should reject negative delivery id', () => {
      expect(() => FindDeliveryRequestSchema.parse({ deliveryId: -1 })).toThrow();
    });

    it('should reject zero delivery id', () => {
      expect(() => FindDeliveryRequestSchema.parse({ deliveryId: 0 })).toThrow();
    });

    it('should reject non-integer delivery id', () => {
      expect(() => FindDeliveryRequestSchema.parse({ deliveryId: 1.5 })).toThrow();
    });

    it('should reject missing delivery id', () => {
      expect(() => FindDeliveryRequestSchema.parse({})).toThrow();
    });
  });
});
