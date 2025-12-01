import { AdaptersFactory } from "../adapters/AdaptersFactory";
import { RepositoriesFactory } from "../repositories/RepositoriesFactory";
import { CreateDeliverySession } from "./CreateDeliverySession"
import { FindDelivery } from "./FindDelivery";
import { ListDeliveries } from "./ListDeliveries";
import { ResendDelivery } from "./ResendDelivery";
import { UpdateDeliveryInstruction } from "./UpdateDeliveryInstruction";
import { UpdateDelivery } from "./UpdateDeliverySession";

export class ServiceFactory {
  private static createDeliverySessionInstance: CreateDeliverySession | undefined;
  private static updateDeliveryInstructionInstance: UpdateDeliveryInstruction | undefined;
  private static listDeliveriesInstance: ListDeliveries | undefined;
  private static findDeliveryInstance: FindDelivery | undefined;
  private static updateDeliverySessionInstance: UpdateDelivery | undefined;
  private static resendDeliveryInstance: ResendDelivery | undefined;

  static getCreateDeliverySession() {
    if (!this.createDeliverySessionInstance) {
      this.createDeliverySessionInstance = new CreateDeliverySession(
        RepositoriesFactory.createDeliveryRepository(),
        AdaptersFactory.getPubSub()
      );
    }

    return this.createDeliverySessionInstance;
  }

  static getUpdateDeliveryInstruction() {
    if (!this.updateDeliveryInstructionInstance) {
      this.updateDeliveryInstructionInstance = new UpdateDeliveryInstruction(
        RepositoriesFactory.createDeliveryRepository()
      );
    }

    return this.updateDeliveryInstructionInstance;
  }

  static getListDeliveriesService() {
    if (!this.listDeliveriesInstance) {
      this.listDeliveriesInstance = new ListDeliveries(
        RepositoriesFactory.createDeliveryRepository()
      );
    }

    return this.listDeliveriesInstance;
  }

  static getFindDeliveryService() {
    if (!this.findDeliveryInstance) {
      this.findDeliveryInstance = new FindDelivery(
        RepositoriesFactory.createDeliveryRepository()
      );
    }

    return this.findDeliveryInstance;
  }

  static getUpdateDeliverySession() {
    if (!this.updateDeliverySessionInstance) {
      this.updateDeliverySessionInstance = new UpdateDelivery(
        RepositoriesFactory.createDeliveryRepository()
      );
    }

    return this.updateDeliverySessionInstance;
  }

  static getResendDelivery() {
    if (!this.resendDeliveryInstance) {
      this.resendDeliveryInstance = new ResendDelivery(
        RepositoriesFactory.createDeliveryRepository(),
        AdaptersFactory.getPubSub()
      );
    }

    return this.resendDeliveryInstance;
  }
}