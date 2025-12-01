import type { DeliveryRepository, DeliveryWithInstructions } from "../repositories/DeliveryRepository";
import z from "zod";
import { NotFoundError } from "../errors/NotFoundError";

export const FindDeliveryRequestSchema = z.object({
  deliveryId: z.number().int().positive(),
});
export type FindDeliveryRequest = z.infer<
  typeof FindDeliveryRequestSchema
>;

export class FindDelivery {
  private deliveryRepository: DeliveryRepository;
  constructor(deliveryRepository: DeliveryRepository) {
    this.deliveryRepository = deliveryRepository
  }

  async execute(data: FindDeliveryRequest): Promise<DeliveryWithInstructions> {
    const { deliveryId } = FindDeliveryRequestSchema.parse(data);

    const delivery = await this.deliveryRepository.findById(deliveryId, "instructions");

    if (!delivery) {
      throw new NotFoundError(`Delivery with ID ${deliveryId} not found.`);
    }

    return delivery;
  }
}