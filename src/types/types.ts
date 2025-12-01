import { Delivery, Instruction } from "@prisma/client";

export interface ClientToServerEvents {
  listenInstructionsChange: (instructionsIds: string[]) => void;
  // outros eventos...
}

export interface ServerToClientEvents {
  // seus eventos do cliente...
  "instructions-change": (data: Partial<Instruction>) => void;
  "delivery-change": (data: Partial<Delivery>) => void;
}

export interface InterServerEvents {
  // ...
}

export interface SocketData {
  username?: string;
}