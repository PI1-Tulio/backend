import type { Delivery, Instruction } from "@prisma/client"
import { PrismaClient } from "@prisma/client";
import { DatabaseConnetion } from "../../infra/database/DatabaseConnection";
import type { CreateDeliveryDTO, DeliveryRepository, DeliveryWithInstructions, ListDeliveriesParams, UpdateDeliveryDTO, UpdateInstructionDTO } from "../DeliveryRepository";

export class PrismaDeliveryRepository implements DeliveryRepository {
  private static INSTANCE: PrismaDeliveryRepository;
  static getInstance(): PrismaDeliveryRepository {
    if (!PrismaDeliveryRepository.INSTANCE) {
      PrismaDeliveryRepository.INSTANCE = new PrismaDeliveryRepository();
    }
    return PrismaDeliveryRepository.INSTANCE;
  }

  private prismaClient: PrismaClient;
  private constructor() {
    this.prismaClient = DatabaseConnetion.getConnection();
  }

  public async findInstructionById(instructionId: number): Promise<Instruction | null> {
    const instruction = await this.prismaClient.instruction.findUnique({
      where: {
        id: instructionId,
      },
    });

    return instruction as Instruction | null;
  }

  public updateInstruction(data: UpdateInstructionDTO): Promise<Instruction> {
    return this.prismaClient.instruction.update({
      where: {
        id: data.instructionId,
      },
      data: {
        actuallyExecuted: data.actuallyExecuted,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });
  }

  public create(data: CreateDeliveryDTO): Promise<Delivery & { instructions: Instruction[] }> {
    return this.prismaClient.delivery.create({
      data: {
        name: data.name,
        potL: data.potL,
        potR: data.potR,
        instructions: {
          createMany: {
            data: data.instructions,
          },
        },
      },
      include: {
        instructions: true,
      },
    })
  }

  list(params: ListDeliveriesParams): Promise<Delivery[]> {
    const { page, pageSize } = params;
    return this.prismaClient.delivery.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  update(data: UpdateDeliveryDTO): Promise<Delivery> {
    return this.prismaClient.delivery.update({
      where: {
        id: data.deliveryId,
      },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });
  }

  findById(deliveryId: number): Promise<Delivery>;
  findById(deliveryId: number, includeInstructions: "instructions"): Promise<DeliveryWithInstructions>;
  public async findById(deliveryId: number, includeInstructions?: "instructions"): Promise<Delivery | DeliveryWithInstructions | null> {
    const include = includeInstructions === "instructions" ? { instructions: true } as const : null;

    const delivery = await this.prismaClient.delivery.findUnique({
      where: {
        id: deliveryId,
      },
      include: include
    });

    return delivery as Delivery | DeliveryWithInstructions | null;
  }

}