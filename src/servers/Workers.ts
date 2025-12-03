import { AdaptersFactory } from "../adapters/AdaptersFactory";
import { env } from "../config/env";
import { ServiceFactory } from "../services/ServiceFatory";
import { io } from "./WebSocketServer";

interface UpdateInstructionPayload {
  instructionId: number;
  value: number;
}

interface UpdateTimePayload {
  id: number;
}

interface BatteryInfo {
  percentage: number;
}

export async function startWorkers(): Promise<void> {
  const pubSub = AdaptersFactory.getPubSub();
  await pubSub.connect(env.MQTT_BROKER_URL);

  pubSub.on("instructions/change/value", (topic, message) => {
    const jsonMessage: UpdateInstructionPayload = JSON.parse(message.toString());

    io.emit("instructions-change", { actuallyExecuted: jsonMessage.value, id: jsonMessage.instructionId });
    ServiceFactory.getUpdateDeliveryInstruction()
      .execute({ instructionId: jsonMessage.instructionId, actuallyExecuted: jsonMessage.value })
      .catch((err) => {
        console.error("Failed to update delivery instruction:", err);
      });
  });

  pubSub.on("instructions/started", (topic, message) => {
    const jsonMessage: UpdateTimePayload = JSON.parse(message.toString());
    const startTime = new Date();

    io.emit("instructions-change", { startTime, id: jsonMessage.id });
    ServiceFactory.getUpdateDeliveryInstruction()
      .execute({ instructionId: jsonMessage.id, startTime })
      .catch((err) => {
        console.error("Failed to update delivery instruction started:", err);
      });
  });

  pubSub.on("delivery/started", (topic, message) => {
    const jsonMessage: UpdateTimePayload = JSON.parse(message.toString());
    const startTime = new Date();

    io.emit("delivery-change", { startTime, id: jsonMessage.id });
    ServiceFactory.getUpdateDeliverySession()
      .execute({ deliveryId: jsonMessage.id, startTime })
      .catch((err) => {
        console.error("Failed to update delivery started:", err);
      });
  });

  pubSub.on("instructions/end", (topic, message) => {
    const jsonMessage: UpdateTimePayload = JSON.parse(message.toString());
    const endTime = new Date();

    io.emit("instructions-change", { endTime, id: jsonMessage.id });
    ServiceFactory.getUpdateDeliveryInstruction()
      .execute({ instructionId: jsonMessage.id, endTime })
      .catch((err) => {
        console.error("Failed to update delivery instruction ended:", err);
      });
  });

  pubSub.on("delivery/end", (topic, message) => {
    const jsonMessage: UpdateTimePayload = JSON.parse(message.toString());
    const endTime = new Date();

    io.emit("delivery-change", { endTime, id: jsonMessage.id });
    ServiceFactory.getUpdateDeliverySession()
      .execute({ deliveryId: jsonMessage.id, endTime })
      .catch((err) => {
        console.error("Failed to update delivery ended:", err);
      });
  });

  pubSub.on("battery/percentage", (topic, message) => {
    const jsonMessage: BatteryInfo = JSON.parse(message.toString());
    io.emit("battery-update", jsonMessage);
  });
}