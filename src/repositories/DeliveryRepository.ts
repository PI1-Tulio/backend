import type { Delivery, Instruction } from "@prisma/client";

export interface CreateDeliveryDTO {
  name: string;
  potL: number;
  potR: number;
  instructions: ({
    action: 'MOVE';
    value: number
  } | { action: 'TURN', value: 0 | 1 })[]
}

export interface UpdateInstructionDTO {
  instructionId: number;
  actuallyExecuted: number | undefined;
  endTime: Date | null | undefined;
  startTime: Date | null | undefined;
}

export interface UpdateDeliveryDTO {
  deliveryId: number;
  endTime: Date | null | undefined;
  startTime: Date | null | undefined;
}

export interface ListDeliveriesParams {
  page: number;
  pageSize: number;
}

export type DeliveryWithInstructions = Delivery & { instructions: Instruction[] };

export interface DeliveryRepository {
  create(data: CreateDeliveryDTO): Promise<DeliveryWithInstructions>;
  update(data: UpdateDeliveryDTO): Promise<Delivery>;
  list(params: ListDeliveriesParams): Promise<Delivery[]>;
  findById(deliveryId: number): Promise<Delivery | null>;
  findById(deliveryId: number, includeInstructions: "instructions"): Promise<DeliveryWithInstructions | null>;

  findInstructionById(instructionId: number): Promise<Instruction | null>;
  updateInstruction(data: UpdateInstructionDTO): Promise<Instruction>;
}