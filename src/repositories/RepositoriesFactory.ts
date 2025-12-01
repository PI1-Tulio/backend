import { PrismaDeliveryRepository } from './implementations/PrismaDeliveryRepository'

export class RepositoriesFactory {
  public static createDeliveryRepository() {
    return PrismaDeliveryRepository.getInstance();
  }
}