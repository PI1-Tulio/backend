import { z } from "zod";
import type { DeliveryRepository } from "../repositories/DeliveryRepository";
import { NotFoundError } from "../errors/NotFoundError";

export const UpdateDeliveryInstructionRequestSchema = z.object({
  instructionId: z.number().int().positive(),
  actuallyExecuted: z.number().positive().optional(),
  startTime: z.date().nullable().optional(),
  endTime: z.date().nullable().optional(),
});

export type UpdateDeliveryInstructionRequest = z.infer<
  typeof UpdateDeliveryInstructionRequestSchema
>;

export class UpdateDeliveryInstruction {
  private deliveryRepository: DeliveryRepository;
  constructor(deliveryRepository: DeliveryRepository) {
    this.deliveryRepository = deliveryRepository
  }

  async execute(updateDeliveryInstructionRequest: UpdateDeliveryInstructionRequest) {
    const { instructionId, actuallyExecuted, startTime, endTime } = UpdateDeliveryInstructionRequestSchema.parse(updateDeliveryInstructionRequest);

    const delivery = await this.deliveryRepository.findInstructionById(instructionId);
    if (!delivery) {
      throw new NotFoundError(`Instruction with ID ${instructionId} not found.`);
    }

    const updatedInstruction = await this.deliveryRepository.updateInstruction({
      instructionId,
      actuallyExecuted,
      startTime,
      endTime,
    });
    console.info("Instruction:", instructionId, "updated successfully with value:", Object.fromEntries(Object.entries({ actuallyExecuted, startTime, endTime }).filter((([_, v]) => v !== undefined))));

    return updatedInstruction;
  }
}