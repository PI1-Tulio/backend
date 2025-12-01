import { MqttPubSub } from "./implementations/MqttPubSub";
import type { PubSub } from "./PubSub";

export class AdaptersFactory {
  private static PubSubINSTANCE: PubSub | undefined;
  static {
    this.PubSubINSTANCE = new MqttPubSub();
  }

  public static getPubSub() {
    if (!this.PubSubINSTANCE) {
      this.PubSubINSTANCE = new MqttPubSub();
    }

    return this.PubSubINSTANCE;
  }
}
