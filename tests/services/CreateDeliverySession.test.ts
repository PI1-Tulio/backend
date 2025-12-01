import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateDeliverySession, CreateDeliverySessionRequestSchema } from '../../src/services/CreateDeliverySession';
import type { DeliveryRepository, DeliveryWithInstructions } from '../../src/repositories/DeliveryRepository';
import type { PubSub } from '../../src/adapters/PubSub';
import type { Instruction } from '@prisma/client';

describe('CreateDeliverySession', () => {
  let deliveryRepository: DeliveryRepository;
  let pubSub: PubSub;
  let createDeliverySession: CreateDeliverySession;

  beforeEach(() => {
    deliveryRepository = {
      create: vi.fn(),
    } as any;
    pubSub = {
      publish: vi.fn(),
    } as any;
    createDeliverySession = new CreateDeliverySession(deliveryRepository, pubSub);
  });

  describe('execute', () => {
    it('should create a delivery session with MOVE and TURN instructions', async () => {
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

      vi.spyOn(deliveryRepository, 'create').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const request = {
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        instructions: [
          { action: 'MOVE' as const, value: 100 },
          { action: 'TURN' as const, value: 1 as const },
        ],
      };

      const result = await createDeliverySession.execute(request);

      expect(deliveryRepository.create).toHaveBeenCalledWith({
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        instructions: [
          { action: 'MOVE', value: 100 },
          { action: 'TURN', value: 1 },
        ],
      });
      expect(result).toEqual(mockDelivery);
      expect(console.info).toHaveBeenCalledWith('Delivery created with ID:', 1);
    });

    it('should publish delivery created event to pubsub', async () => {
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

      vi.spyOn(deliveryRepository, 'create').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const request = {
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        instructions: [{ action: 'MOVE' as const, value: 100 }],
      };

      await createDeliverySession.execute(request);

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

      vi.spyOn(deliveryRepository, 'create').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const request = {
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        instructions: [
          { action: 'MOVE' as const, value: 100 },
          { action: 'TURN' as const, value: 0 as const },
        ],
      };

      await createDeliverySession.execute(request);

      const publishCall = (pubSub.publish as any).mock.calls[0];
      const message = JSON.parse(publishCall[1]);

      expect(message.instructions[0].action).toBe('move');
      expect(message.instructions[1].action).toBe('turn');
    });

    it('should throw error for invalid name (empty string)', async () => {
      const request = {
        name: '',
        potL: 150,
        potR: 150,
        instructions: [{ action: 'MOVE' as const, value: 100 }],
      };

      await expect(createDeliverySession.execute(request)).rejects.toThrow();
    });

    it('should throw error for invalid potL (negative)', async () => {
      const request = {
        name: 'Test',
        potL: -10,
        potR: 150,
        instructions: [{ action: 'MOVE' as const, value: 100 }],
      };

      await expect(createDeliverySession.execute(request)).rejects.toThrow();
    });

    it('should throw error for invalid potR (zero)', async () => {
      const request = {
        name: 'Test',
        potL: 150,
        potR: 0,
        instructions: [{ action: 'MOVE' as const, value: 100 }],
      };

      await expect(createDeliverySession.execute(request)).rejects.toThrow();
    });

    it('should throw error for invalid MOVE instruction (negative value)', async () => {
      const request = {
        name: 'Test',
        potL: 150,
        potR: 150,
        instructions: [{ action: 'MOVE' as const, value: -100 }],
      };

      await expect(createDeliverySession.execute(request)).rejects.toThrow();
    });

    it('should throw error for invalid TURN instruction value', async () => {
      const request = {
        name: 'Test',
        potL: 150,
        potR: 150,
        instructions: [{ action: 'TURN' as const, value: 2 }] as any,
      };

      await expect(createDeliverySession.execute(request)).rejects.toThrow();
    });

    it('should accept TURN with value 0 (left)', async () => {
      const mockInstructions: Instruction[] = [
        {
          id: 1,
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

      vi.spyOn(deliveryRepository, 'create').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const request = {
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        instructions: [{ action: 'TURN' as const, value: 0 as const }],
      };

      const result = await createDeliverySession.execute(request);

      expect(result).toEqual(mockDelivery);
    });

    it('should accept empty instructions array', async () => {
      const mockDelivery: DeliveryWithInstructions = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
        instructions: [],
      };

      vi.spyOn(deliveryRepository, 'create').mockResolvedValue(mockDelivery);
      vi.spyOn(pubSub, 'publish').mockImplementation(() => { });
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const request = {
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        instructions: [],
      };

      const result = await createDeliverySession.execute(request);

      expect(result).toEqual(mockDelivery);
    });
  });

  describe('CreateDeliverySessionRequestSchema', () => {
    it('should validate valid request with MOVE instruction', () => {
      const request = {
        name: 'Test',
        potL: 150,
        potR: 150,
        instructions: [{ action: 'MOVE', value: 100 }],
      };

      const result = CreateDeliverySessionRequestSchema.parse(request);
      expect(result).toEqual(request);
    });

    it('should validate valid request with TURN instruction (left)', () => {
      const request = {
        name: 'Test',
        potL: 150,
        potR: 150,
        instructions: [{ action: 'TURN', value: 0 }],
      };

      const result = CreateDeliverySessionRequestSchema.parse(request);
      expect(result).toEqual(request);
    });

    it('should validate valid request with TURN instruction (right)', () => {
      const request = {
        name: 'Test',
        potL: 150,
        potR: 150,
        instructions: [{ action: 'TURN', value: 1 }],
      };

      const result = CreateDeliverySessionRequestSchema.parse(request);
      expect(result).toEqual(request);
    });

    it('should reject request with missing name', () => {
      const request = {
        potL: 150,
        potR: 150,
        instructions: [],
      };

      expect(() => CreateDeliverySessionRequestSchema.parse(request)).toThrow();
    });

    it('should reject request with missing potL', () => {
      const request = {
        name: 'Test',
        potR: 150,
        instructions: [],
      };

      expect(() => CreateDeliverySessionRequestSchema.parse(request)).toThrow();
    });
  });
});
