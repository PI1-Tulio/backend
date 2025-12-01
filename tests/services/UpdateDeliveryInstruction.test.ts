import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateDeliveryInstruction, UpdateDeliveryInstructionRequestSchema } from '../../src/services/UpdateDeliveryInstruction';
import type { DeliveryRepository } from '../../src/repositories/DeliveryRepository';
import type { Instruction } from '@prisma/client';
import { NotFoundError } from '../../src/errors/NotFoundError';

describe('UpdateDeliveryInstruction', () => {
  let deliveryRepository: DeliveryRepository;
  let updateDeliveryInstruction: UpdateDeliveryInstruction;

  beforeEach(() => {
    deliveryRepository = {
      findInstructionById: vi.fn(),
      updateInstruction: vi.fn(),
    } as any;
    updateDeliveryInstruction = new UpdateDeliveryInstruction(deliveryRepository);
  });

  describe('execute', () => {
    it('should update instruction with actuallyExecuted', async () => {
      const mockInstruction: Instruction = {
        id: 1,
        action: 'MOVE',
        value: 100,
        actuallyExecuted: 0,
        startTime: null,
        endTime: null,
        deliveryId: 1,
      };

      const updatedInstruction: Instruction = {
        ...mockInstruction,
        actuallyExecuted: 95,
      };

      vi.spyOn(deliveryRepository, 'findInstructionById').mockResolvedValue(mockInstruction);
      vi.spyOn(deliveryRepository, 'updateInstruction').mockResolvedValue(updatedInstruction);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDeliveryInstruction.execute({
        instructionId: 1,
        actuallyExecuted: 95,
      });

      expect(deliveryRepository.findInstructionById).toHaveBeenCalledWith(1);
      expect(deliveryRepository.updateInstruction).toHaveBeenCalledWith({
        instructionId: 1,
        actuallyExecuted: 95,
        startTime: undefined,
        endTime: undefined,
      });
      expect(result).toEqual(updatedInstruction);
      expect(console.info).toHaveBeenCalledWith(
        'Instruction:',
        1,
        'updated successfully with value:',
        { actuallyExecuted: 95 }
      );
    });

    it('should update instruction with startTime', async () => {
      const mockInstruction: Instruction = {
        id: 1,
        action: 'MOVE',
        value: 100,
        actuallyExecuted: 0,
        startTime: null,
        endTime: null,
        deliveryId: 1,
      };

      const startTime = new Date('2024-01-01T10:00:00Z');
      const updatedInstruction: Instruction = {
        ...mockInstruction,
        startTime,
      };

      vi.spyOn(deliveryRepository, 'findInstructionById').mockResolvedValue(mockInstruction);
      vi.spyOn(deliveryRepository, 'updateInstruction').mockResolvedValue(updatedInstruction);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDeliveryInstruction.execute({
        instructionId: 1,
        startTime,
      });

      expect(result.startTime).toEqual(startTime);
      expect(console.info).toHaveBeenCalledWith(
        'Instruction:',
        1,
        'updated successfully with value:',
        { startTime }
      );
    });

    it('should update instruction with endTime', async () => {
      const mockInstruction: Instruction = {
        id: 1,
        action: 'MOVE',
        value: 100,
        actuallyExecuted: 0,
        startTime: null,
        endTime: null,
        deliveryId: 1,
      };

      const endTime = new Date('2024-01-01T10:05:00Z');
      const updatedInstruction: Instruction = {
        ...mockInstruction,
        endTime,
      };

      vi.spyOn(deliveryRepository, 'findInstructionById').mockResolvedValue(mockInstruction);
      vi.spyOn(deliveryRepository, 'updateInstruction').mockResolvedValue(updatedInstruction);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDeliveryInstruction.execute({
        instructionId: 1,
        endTime,
      });

      expect(result.endTime).toEqual(endTime);
    });

    it('should update instruction with all fields', async () => {
      const mockInstruction: Instruction = {
        id: 1,
        action: 'MOVE',
        value: 100,
        actuallyExecuted: 0,
        startTime: null,
        endTime: null,
        deliveryId: 1,
      };

      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z');
      const updatedInstruction: Instruction = {
        ...mockInstruction,
        actuallyExecuted: 95,
        startTime,
        endTime,
      };

      vi.spyOn(deliveryRepository, 'findInstructionById').mockResolvedValue(mockInstruction);
      vi.spyOn(deliveryRepository, 'updateInstruction').mockResolvedValue(updatedInstruction);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDeliveryInstruction.execute({
        instructionId: 1,
        actuallyExecuted: 95,
        startTime,
        endTime,
      });

      expect(deliveryRepository.updateInstruction).toHaveBeenCalledWith({
        instructionId: 1,
        actuallyExecuted: 95,
        startTime,
        endTime,
      });
      expect(result).toEqual(updatedInstruction);
    });

    it('should update instruction with null startTime', async () => {
      const mockInstruction: Instruction = {
        id: 1,
        action: 'MOVE',
        value: 100,
        actuallyExecuted: 0,
        startTime: new Date(),
        endTime: null,
        deliveryId: 1,
      };

      const updatedInstruction: Instruction = {
        ...mockInstruction,
        startTime: null,
      };

      vi.spyOn(deliveryRepository, 'findInstructionById').mockResolvedValue(mockInstruction);
      vi.spyOn(deliveryRepository, 'updateInstruction').mockResolvedValue(updatedInstruction);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDeliveryInstruction.execute({
        instructionId: 1,
        startTime: null,
      });

      expect(result.startTime).toBeNull();
    });

    it('should update instruction with null endTime', async () => {
      const mockInstruction: Instruction = {
        id: 1,
        action: 'MOVE',
        value: 100,
        actuallyExecuted: 0,
        startTime: null,
        endTime: new Date(),
        deliveryId: 1,
      };

      const updatedInstruction: Instruction = {
        ...mockInstruction,
        endTime: null,
      };

      vi.spyOn(deliveryRepository, 'findInstructionById').mockResolvedValue(mockInstruction);
      vi.spyOn(deliveryRepository, 'updateInstruction').mockResolvedValue(updatedInstruction);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await updateDeliveryInstruction.execute({
        instructionId: 1,
        endTime: null,
      });

      expect(result.endTime).toBeNull();
    });

    it('should throw NotFoundError when instruction does not exist', async () => {
      vi.spyOn(deliveryRepository, 'findInstructionById').mockResolvedValue(null);

      await expect(
        updateDeliveryInstruction.execute({
          instructionId: 999,
          actuallyExecuted: 100,
        })
      ).rejects.toThrow(NotFoundError);

      await expect(
        updateDeliveryInstruction.execute({
          instructionId: 999,
          actuallyExecuted: 100,
        })
      ).rejects.toThrow('Instruction with ID 999 not found.');
    });

    it('should not call updateInstruction when instruction not found', async () => {
      vi.spyOn(deliveryRepository, 'findInstructionById').mockResolvedValue(null);
      vi.spyOn(deliveryRepository, 'updateInstruction').mockResolvedValue({} as any);

      await expect(
        updateDeliveryInstruction.execute({
          instructionId: 999,
          actuallyExecuted: 100,
        })
      ).rejects.toThrow();

      expect(deliveryRepository.updateInstruction).not.toHaveBeenCalled();
    });

    it('should throw error for invalid instructionId (negative)', async () => {
      await expect(
        updateDeliveryInstruction.execute({
          instructionId: -1,
          actuallyExecuted: 100,
        })
      ).rejects.toThrow();
    });

    it('should throw error for invalid instructionId (zero)', async () => {
      await expect(
        updateDeliveryInstruction.execute({
          instructionId: 0,
          actuallyExecuted: 100,
        })
      ).rejects.toThrow();
    });

    it('should throw error for invalid actuallyExecuted (negative)', async () => {
      await expect(
        updateDeliveryInstruction.execute({
          instructionId: 1,
          actuallyExecuted: -1,
        })
      ).rejects.toThrow();
    });

    it('should throw error for invalid actuallyExecuted (zero)', async () => {
      await expect(
        updateDeliveryInstruction.execute({
          instructionId: 1,
          actuallyExecuted: 0,
        })
      ).rejects.toThrow();
    });
  });

  describe('UpdateDeliveryInstructionRequestSchema', () => {
    it('should validate valid request with only instructionId', () => {
      const result = UpdateDeliveryInstructionRequestSchema.parse({
        instructionId: 1,
      });
      expect(result.instructionId).toBe(1);
    });

    it('should validate valid request with actuallyExecuted', () => {
      const result = UpdateDeliveryInstructionRequestSchema.parse({
        instructionId: 1,
        actuallyExecuted: 95,
      });
      expect(result).toEqual({ instructionId: 1, actuallyExecuted: 95 });
    });

    it('should validate valid request with startTime', () => {
      const startTime = new Date();
      const result = UpdateDeliveryInstructionRequestSchema.parse({
        instructionId: 1,
        startTime,
      });
      expect(result.startTime).toEqual(startTime);
    });

    it('should validate valid request with null startTime', () => {
      const result = UpdateDeliveryInstructionRequestSchema.parse({
        instructionId: 1,
        startTime: null,
      });
      expect(result.startTime).toBeNull();
    });

    it('should reject negative instructionId', () => {
      expect(() =>
        UpdateDeliveryInstructionRequestSchema.parse({
          instructionId: -1,
        })
      ).toThrow();
    });

    it('should reject zero instructionId', () => {
      expect(() =>
        UpdateDeliveryInstructionRequestSchema.parse({
          instructionId: 0,
        })
      ).toThrow();
    });

    it('should reject missing instructionId', () => {
      expect(() =>
        UpdateDeliveryInstructionRequestSchema.parse({
          actuallyExecuted: 100,
        })
      ).toThrow();
    });
  });
});
