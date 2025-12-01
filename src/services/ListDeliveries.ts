import type { Delivery } from "@prisma/client";
import type { DeliveryRepository } from "../repositories/DeliveryRepository";
import z from "zod";

export const ListDeliveriesRequestSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(10),
});
export type ListDeliveriesRequest = z.infer<
  typeof ListDeliveriesRequestSchema
>;

export class ListDeliveries {
  private deliveryRepository: DeliveryRepository;
  constructor(deliveryRepository: DeliveryRepository) {
    this.deliveryRepository = deliveryRepository
  }

  async execute(data: { page: number | undefined, pageSize: number | undefined }): Promise<Delivery[]> {
    const { page, pageSize } = ListDeliveriesRequestSchema.parse(data);

    const deliveries = await this.deliveryRepository.list({
      page,
      pageSize: 100000,
    });
    console.info("Fetched", deliveries.length, "deliveries from the repository.");

    return deliveries;
  }
}