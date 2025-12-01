import { z } from "zod";
import type { DeliveryRepository, DeliveryWithInstructions } from "../repositories/DeliveryRepository";
import type { Delivery, Instruction } from "@prisma/client";
import type { PubSub } from "../adapters/PubSub";

const MoveForward = z.object({
  action: z.literal("MOVE"),
  value: z.number().positive(),
});

const Turn = z.object({
  action: z.literal("TURN"),
  value: z.union([z.literal(0), z.literal(1)]), // 0: left, 1: right
});

export const CreateDeliverySessionRequestSchema = z.object({
  name: z.string().min(1),
  potL: z.number().positive(),
  potR: z.number().positive(),
  instructions: z.array(z.union([MoveForward, Turn])),
});

export type CreateDeliverySessionRequest = z.infer<
  typeof CreateDeliverySessionRequestSchema
>;

export class CreateDeliverySession {
  private deliveryRepository: DeliveryRepository;
  private pubSub: PubSub;
  constructor(deliveryRepository: DeliveryRepository, pubSub: PubSub) {
    this.deliveryRepository = deliveryRepository
    this.pubSub = pubSub;
  }

  async execute(createDeliverySessionDTO: CreateDeliverySessionRequest): Promise<DeliveryWithInstructions> {
    const parsedCreateDeliverySessionDTO = CreateDeliverySessionRequestSchema.parse(createDeliverySessionDTO);

    const delivery = await this.deliveryRepository.create({
      name: parsedCreateDeliverySessionDTO.name,
      instructions: parsedCreateDeliverySessionDTO.instructions,
      potL: parsedCreateDeliverySessionDTO.potL,
      potR: parsedCreateDeliverySessionDTO.potR,
    });
    console.info("Delivery created with ID:", delivery.id);

    this.pubSub.publish('delivery/created', JSON.stringify({
      id: delivery.id,
      potL: parsedCreateDeliverySessionDTO.potL,
      potR: parsedCreateDeliverySessionDTO.potR,
      instructions: delivery.instructions.map((instruction) => ({
        id: instruction.id,
        action: instruction.action.toLowerCase(),
        value: instruction.value,
      })),
      timestamp: new Date().getTime()
    }));

    return delivery;
  }
}