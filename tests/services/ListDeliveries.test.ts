import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListDeliveries, ListDeliveriesRequestSchema } from '../../src/services/ListDeliveries';
import type { DeliveryRepository } from '../../src/repositories/DeliveryRepository';
import type { Delivery } from '@prisma/client';

describe('ListDeliveries', () => {
  let deliveryRepository: DeliveryRepository;
  let listDeliveries: ListDeliveries;

  beforeEach(() => {
    deliveryRepository = {
      list: vi.fn(),
    } as any;
    listDeliveries = new ListDeliveries(deliveryRepository);
  });

  describe('execute', () => {
    it('should list deliveries with default pagination', async () => {
      const mockDeliveries: Delivery[] = [
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

      vi.spyOn(deliveryRepository, 'list').mockResolvedValue(mockDeliveries);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await listDeliveries.execute({ page: undefined, pageSize: undefined });

      expect(deliveryRepository.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 100000,
      });
      expect(result).toEqual(mockDeliveries);
      expect(console.info).toHaveBeenCalledWith('Fetched', 2, 'deliveries from the repository.');
    });

    it('should list deliveries with custom pagination', async () => {
      const mockDeliveries: Delivery[] = [
        {
          id: 1,
          name: 'Delivery 1',
          potL: 100,
          potR: 100,
          startTime: null,
          endTime: null,
        },
      ];

      vi.spyOn(deliveryRepository, 'list').mockResolvedValue(mockDeliveries);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await listDeliveries.execute({ page: 2, pageSize: 5 });

      expect(deliveryRepository.list).toHaveBeenCalledWith({
        page: 2,
        pageSize: 100000,
      });
      expect(result).toEqual(mockDeliveries);
    });

    it('should return empty array when no deliveries exist', async () => {
      vi.spyOn(deliveryRepository, 'list').mockResolvedValue([]);
      vi.spyOn(console, 'info').mockImplementation(() => { });

      const result = await listDeliveries.execute({ page: 1, pageSize: 10 });

      expect(result).toEqual([]);
      expect(console.info).toHaveBeenCalledWith('Fetched', 0, 'deliveries from the repository.');
    });

    it('should throw error for invalid page number', async () => {
      await expect(
        listDeliveries.execute({ page: 0, pageSize: 10 })
      ).rejects.toThrow();
    });

    it('should throw error for negative page number', async () => {
      await expect(
        listDeliveries.execute({ page: -1, pageSize: 10 })
      ).rejects.toThrow();
    });

    it('should throw error for invalid pageSize', async () => {
      await expect(
        listDeliveries.execute({ page: 1, pageSize: 0 })
      ).rejects.toThrow();
    });

    it('should throw error for non-integer page', async () => {
      await expect(
        listDeliveries.execute({ page: 1.5, pageSize: 10 } as any)
      ).rejects.toThrow();
    });
  });

  describe('ListDeliveriesRequestSchema', () => {
    it('should validate valid request with default values', () => {
      const result = ListDeliveriesRequestSchema.parse({});
      expect(result).toEqual({ page: 1, pageSize: 10 });
    });

    it('should validate valid request with custom values', () => {
      const result = ListDeliveriesRequestSchema.parse({ page: 2, pageSize: 20 });
      expect(result).toEqual({ page: 2, pageSize: 20 });
    });

    it('should reject negative page', () => {
      expect(() => ListDeliveriesRequestSchema.parse({ page: -1 })).toThrow();
    });

    it('should reject zero page', () => {
      expect(() => ListDeliveriesRequestSchema.parse({ page: 0 })).toThrow();
    });

    it('should reject negative pageSize', () => {
      expect(() => ListDeliveriesRequestSchema.parse({ pageSize: -1 })).toThrow();
    });
  });
});
