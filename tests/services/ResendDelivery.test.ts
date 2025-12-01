import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResendDelivery, ResendDeliveryRequestSchema } from '../../src/services/ResendDelivery';
import type { DeliveryRepository, DeliveryWithInstructions } from '../../src/repositories/DeliveryRepository';
import type { PubSub } from '../../src/adapters/PubSub';
import type { Instruction } from '@prisma/client';
import { NotFoundError } from '../../src/errors/NotFoundError';

describe('ResendDelivery', () => {
  let deliveryRepository: DeliveryRepository;
  let pubSub: PubSub;
  let resendDelivery: ResendDelivery;

  beforeEach(() => {
    deliveryRepository = {
      findById: vi.fn(),
    } as any;
    pubSub = {
      publish: vi.fn(),
    } as any;
    resendDelivery = new ResendDelivery(deliveryRepository, pubSub);
  });

  describe('execute', () => {
    it('should resend delivery successfully', async () => {
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
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
        instructions: mockInstructions,
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      vi.spyOn(console, 'log').mockImplementation(() => { });

      const result = await resendDelivery.execute({ id: 1 });

      expect(deliveryRepository.findById).toHaveBeenCalledWith(1, 'instructions');
      expect(result).toEqual(mockDelivery);
    });

    it('should publish delivery to pubsub when resending', async () => {
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
      ];

      const mockDelivery: DeliveryWithInstructions = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
        instructions: mockInstructions,
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      vi.spyOn(console, 'log').mockImplementation(() => { });

      await resendDelivery.execute({ id: 1 });

      expect(pubSub.publish).toHaveBeenCalledWith(
        'delivery/created',
        expect.stringContaining('"id":1')
      );
      expect(pubSub.publish).toHaveBeenCalledWith(
        'delivery/created',
        expect.stringContaining('"potL":150')
      );
      expect(pubSub.publish).toHaveBeenCalledWith(
        'delivery/created',
        expect.stringContaining('"potR":150')
      );
    });

    it('should transform instruction actions to lowercase in pubsub message', async () => {
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
          value: 0,
          actuallyExecuted: 0,
          startTime: null,
          endTime: null,
          deliveryId: 1,
        },
      ];

      const mockDelivery: DeliveryWithInstructions = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
        instructions: mockInstructions,
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      vi.spyOn(console, 'log').mockImplementation(() => { });

      await resendDelivery.execute({ id: 1 });

      const publishCall = (pubSub.publish as any).mock.calls[0];
      const message = JSON.parse(publishCall[1]);

      expect(message.instructions[0].action).toBe('move');
      expect(message.instructions[1].action).toBe('turn');
      expect(message.instructions[0].id).toBe(1);
      expect(message.instructions[0].value).toBe(100);
      expect(message.instructions[1].id).toBe(2);
      expect(message.instructions[1].value).toBe(0);
    });

    it('should throw NotFoundError when delivery does not exist', async () => {
      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(null);

      await expect(
        resendDelivery.execute({ id: 999 })
      ).rejects.toThrow(NotFoundError);

      await expect(
        resendDelivery.execute({ id: 999 })
      ).rejects.toThrow('Delivery not found');
    });

    it('should not publish when delivery is not found', async () => {
      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(null);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });

      await expect(
        resendDelivery.execute({ id: 999 })
      ).rejects.toThrow();

      expect(pubSub.publish).not.toHaveBeenCalled();
    });

    it('should handle delivery with empty instructions', async () => {
      const mockDelivery: DeliveryWithInstructions = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
        instructions: [],
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      vi.spyOn(console, 'log').mockImplementation(() => { });

      const result = await resendDelivery.execute({ id: 1 });

      expect(result.instructions).toEqual([]);
      expect(pubSub.publish).toHaveBeenCalled();
    });

    it('should log payload and length', async () => {
      const mockDelivery: DeliveryWithInstructions = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
        instructions: [],
      };

      vi.spyOn(deliveryRepository, 'findById').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      await resendDelivery.execute({ id: 1 });

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0];
      expect(logCall).toHaveLength(2);
      expect(typeof logCall[0]).toBe('string');
      expect(typeof logCall[1]).toBe('number');
    });
  });

  describe('ResendDeliveryRequestSchema', () => {
    it('should validate valid delivery id', () => {
      const result = ResendDeliveryRequestSchema.parse({ id: 1 });
      expect(result).toEqual({ id: 1 });
    });

    it('should accept zero as valid id', () => {
      const result = ResendDeliveryRequestSchema.parse({ id: 0 });
      expect(result).toEqual({ id: 0 });
    });

    it('should accept negative numbers', () => {
      const result = ResendDeliveryRequestSchema.parse({ id: -1 });
      expect(result).toEqual({ id: -1 });
    });

    it('should reject missing id', () => {
      expect(() => ResendDeliveryRequestSchema.parse({})).toThrow();
    });

    it('should reject non-number id', () => {
      expect(() => ResendDeliveryRequestSchema.parse({ id: 'abc' })).toThrow();
    });
  });
});
