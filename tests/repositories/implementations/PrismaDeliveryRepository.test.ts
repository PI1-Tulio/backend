import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PrismaDeliveryRepository } from '../../../src/repositories/implementations/PrismaDeliveryRepository';
import type { PrismaClient, Delivery, Instruction } from '@prisma/client';
import { DatabaseConnetion } from '../../../src/infra/database/DatabaseConnection';

// Mock the DatabaseConnection
vi.mock('../../../src/infra/database/DatabaseConnection', () => ({
  DatabaseConnetion: {
    getConnection: vi.fn(),
  },
}));

describe('PrismaDeliveryRepository', () => {
  let repository: PrismaDeliveryRepository;
  let mockPrismaClient: any;

  beforeEach(() => {
    // Reset the singleton instance
    (PrismaDeliveryRepository as any).INSTANCE = undefined;

    // Create mock Prisma client
    mockPrismaClient = {
      delivery: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      instruction: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    vi.mocked(DatabaseConnetion.getConnection).mockReturnValue(mockPrismaClient as any);
    repository = PrismaDeliveryRepository.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = PrismaDeliveryRepository.getInstance();
      const instance2 = PrismaDeliveryRepository.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should call DatabaseConnection.getConnection on first instantiation', () => {
      (PrismaDeliveryRepository as any).INSTANCE = undefined;

      PrismaDeliveryRepository.getInstance();

      expect(DatabaseConnetion.getConnection).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a delivery with instructions', async () => {
      const mockDelivery = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
        instructions: [
          {
            id: 1,
            action: 'MOVE',
            value: 100,
            actuallyExecuted: 0,
            startTime: null,
            endTime: null,
            deliveryId: 1,
          },
        ],
      };

      mockPrismaClient.delivery.create.mockResolvedValue(mockDelivery);

      const result = await repository.create({
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        instructions: [{ action: 'MOVE', value: 100 }],
      });

      expect(mockPrismaClient.delivery.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Delivery',
          potL: 150,
          potR: 150,
          instructions: {
            createMany: {
              data: [{ action: 'MOVE', value: 100 }],
            },
          },
        },
        include: {
          instructions: true,
        },
      });
      expect(result).toEqual(mockDelivery);
    });
  });

  describe('list', () => {
    it('should list deliveries with pagination', async () => {
      const mockDeliveries = [
        {
          id: 1,
          name: 'Delivery 1',
          potL: 100,
          potR: 100,
          startTime: null,
          endTime: null,
        },
        {
          id: 2,
          name: 'Delivery 2',
          potL: 200,
          potR: 200,
          startTime: null,
          endTime: null,
        },
      ];

      mockPrismaClient.delivery.findMany.mockResolvedValue(mockDeliveries);

      const result = await repository.list({ page: 1, pageSize: 10 });

      expect(mockPrismaClient.delivery.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(mockDeliveries);
    });

    it('should calculate skip correctly for page 2', async () => {
      mockPrismaClient.delivery.findMany.mockResolvedValue([]);

      await repository.list({ page: 2, pageSize: 10 });

      expect(mockPrismaClient.delivery.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
      });
    });

    it('should handle different page sizes', async () => {
      mockPrismaClient.delivery.findMany.mockResolvedValue([]);

      await repository.list({ page: 3, pageSize: 25 });

      expect(mockPrismaClient.delivery.findMany).toHaveBeenCalledWith({
        skip: 50,
        take: 25,
      });
    });
  });

  describe('findById', () => {
    it('should find delivery by id without instructions', async () => {
      const mockDelivery: Delivery = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
      };

      mockPrismaClient.delivery.findUnique.mockResolvedValue(mockDelivery);

      const result = await repository.findById(1);

      expect(mockPrismaClient.delivery.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: null,
      });
      expect(result).toEqual(mockDelivery);
    });

    it('should find delivery by id with instructions', async () => {
      const mockDelivery = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime: null,
        endTime: null,
        instructions: [
          {
            id: 1,
            action: 'MOVE',
            value: 100,
            actuallyExecuted: 0,
            startTime: null,
            endTime: null,
            deliveryId: 1,
          },
        ],
      };

      mockPrismaClient.delivery.findUnique.mockResolvedValue(mockDelivery);

      const result = await repository.findById(1, 'instructions');

      expect(mockPrismaClient.delivery.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { instructions: true },
      });
      expect(result).toEqual(mockDelivery);
    });

    it('should return null when delivery not found', async () => {
      mockPrismaClient.delivery.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update delivery', async () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z');
      const mockUpdatedDelivery: Delivery = {
        id: 1,
        name: 'Test Delivery',
        potL: 150,
        potR: 150,
        startTime,
        endTime,
      };

      mockPrismaClient.delivery.update.mockResolvedValue(mockUpdatedDelivery);

      const result = await repository.update({
        deliveryId: 1,
        startTime,
        endTime,
      });

      expect(mockPrismaClient.delivery.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          startTime,
          endTime,
        },
      });
      expect(result).toEqual(mockUpdatedDelivery);
    });
  });

  describe('findInstructionById', () => {
    it('should find instruction by id', async () => {
      const mockInstruction: Instruction = {
        id: 1,
        action: 'MOVE',
        value: 100,
        actuallyExecuted: 0,
        startTime: null,
        endTime: null,
        deliveryId: 1,
      };

      mockPrismaClient.instruction.findUnique.mockResolvedValue(mockInstruction);

      const result = await repository.findInstructionById(1);

      expect(mockPrismaClient.instruction.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockInstruction);
    });

    it('should return null when instruction not found', async () => {
      mockPrismaClient.instruction.findUnique.mockResolvedValue(null);

      const result = await repository.findInstructionById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateInstruction', () => {
    it('should update instruction', async () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z');
      const mockUpdatedInstruction: Instruction = {
        id: 1,
        action: 'MOVE',
        value: 100,
        actuallyExecuted: 95,
        startTime,
        endTime,
        deliveryId: 1,
      };

      mockPrismaClient.instruction.update.mockResolvedValue(mockUpdatedInstruction);

      const result = await repository.updateInstruction({
        instructionId: 1,
        actuallyExecuted: 95,
        startTime,
        endTime,
      });

      expect(mockPrismaClient.instruction.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          actuallyExecuted: 95,
          startTime,
          endTime,
        },
      });
      expect(result).toEqual(mockUpdatedInstruction);
    });
  });
});
