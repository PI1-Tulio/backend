import { z } from "zod";
import type { DeliveryRepository, DeliveryWithInstructions } from "../repositories/DeliveryRepository";
import type { PubSub } from "../adapters/PubSub";
import { NotFoundError } from "../errors/NotFoundError";


export const ResendDeliveryRequestSchema = z.object({
  id: z.number()
});

export type ResendDeliveryRequest = z.infer<
  typeof ResendDeliveryRequestSchema
>;

export class ResendDelivery {
  private deliveryRepository: DeliveryRepository;
  private pubSub: PubSub;
  constructor(deliveryRepository: DeliveryRepository, pubSub: PubSub) {
    this.deliveryRepository = deliveryRepository
    this.pubSub = pubSub;
  }

  async execute(ResendDeliveryDTO: ResendDeliveryRequest): Promise<DeliveryWithInstructions> {
    const { id } = ResendDeliveryRequestSchema.parse(ResendDeliveryDTO);

    const delivery = await this.deliveryRepository.findById(id, "instructions");
    if (!delivery) {
      throw new NotFoundError("Delivery not found");
    }

    const payloadToResend = JSON.stringify({
      id: delivery.id,
      potL: delivery.potL,
      potR: delivery.potR,
      instructions: delivery.instructions.map((instruction) => ({
        id: instruction.id,
        action: instruction.action.toLowerCase(),
        value: instruction.value,
      }))
    });
    this.pubSub.publish('delivery/created', payloadToResend);
    console.log(payloadToResend, payloadToResend.length)

    return delivery;
  }
}