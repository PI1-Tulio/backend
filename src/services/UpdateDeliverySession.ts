import { z } from "zod";
import type { DeliveryRepository } from "../repositories/DeliveryRepository";
import { NotFoundError } from "../errors/NotFoundError";

export const UpdateDeliveryRequestSchema = z.object({
  deliveryId: z.number().int().positive(),
  startTime: z.date().nullable().optional(),
  endTime: z.date().nullable().optional(),
});

export type UpdateDeliveryRequest = z.infer<
  typeof UpdateDeliveryRequestSchema
>;

export class UpdateDelivery {
  private deliveryRepository: DeliveryRepository;
  constructor(deliveryRepository: DeliveryRepository) {
    this.deliveryRepository = deliveryRepository
  }

  async execute(updateDeliveryRequest: UpdateDeliveryRequest) {
    const { deliveryId, startTime, endTime } = UpdateDeliveryRequestSchema.parse(updateDeliveryRequest);

    const delivery = await this.deliveryRepository.findById(deliveryId);
    if (!delivery) {
      throw new NotFoundError(` with ID ${deliveryId} not found.`);
    }

    const updated = await this.deliveryRepository.update({
      deliveryId,
      startTime,
      endTime,
    });
    console.info("Delivery with id:", deliveryId, "updated successfully.");

    return updated;
  }
}