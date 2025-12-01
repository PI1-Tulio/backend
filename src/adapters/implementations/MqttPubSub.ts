import mqtt, { MqttClient } from 'mqtt';
import type { PubSub } from '../PubSub';

type TopicHandlerTree = {
  [topic: string]: {
    handlers: ((topic: string, message: Buffer) => void)[];
    children: TopicHandlerTree;
  }
};

export class MqttPubSub implements PubSub {
  private client: MqttClient | undefined;
  // private listeners: TopicHandlerTree = {}
  private listeners: Record<string, ((topic: string, message: Buffer) => void)[]> = {};

  // private deliveryMessage(
  //   currentNode: TopicHandlerTree,
  //   topic: string,
  //   message: Buffer<ArrayBufferLike>,
  //   parts: string[],
  //   partIndex: number,
  // ) {
  //   if (partIndex >= parts.length) {
  //     return;
  //   }
  //   if (currentNode["#"]) {
  //     currentNode["#"].handlers.forEach(handler => {
  //       handler(topic, message);
  //     });
  //   }

  //   const matchedValues: TopicHandlerTree[string][] = [];
  //   if (currentNode[parts[partIndex]]) {
  //     matchedValues.push(currentNode[parts[partIndex]]);
  //   }
  //   if (currentNode["+"]) {
  //     matchedValues.push(currentNode["+"]);
  //   }

  //   if (partIndex === parts.length - 1) {
  //     return matchedValues.forEach((nodes) => {
  //       nodes.handlers.forEach(handler => {
  //         handler(topic, message);
  //       })
  //     })
  //   }

  //   matchedValues.forEach((node) => {
  //     this.deliveryMessage(node.children, topic, message, parts, partIndex + 1);
  //   });
  // }

  async connect(brokerUrl: string): Promise<void> {
    if (this.client && this.client.connected) {
      return;
    }

    this.client = mqtt.connect(brokerUrl, {
      clientId: "BackendService",
    });

    this.client.on('message', (topic, message, packet) => {
      console.log(`Received message on topic ${topic}: ${message.toString()}`);
      if (packet.retain) {
        return;
      }
      this.listeners[topic]?.forEach((handler) => {
        handler(topic, message);
      });
      // new Promise<void>((resolve) => {
      //   this.deliveryMessage(this.listeners, topic, message, topic.split("/"), 0);
      //   resolve();
      // });
    });

    this.client.on("disconnect", () => {
      console.warn("MQTT client disconnected. Attempting to reconnect...");
      this.client?.reconnect();
    });

    return new Promise((resolve, reject) => {
      this.client?.on('connect', () => {
        resolve();
      });
      this.client?.on('error', (error) => {
        reject(error);
      });
    });
  }

  publish(topic: string, message: string | Buffer, options?: object): void {
    if (!this.client) {
      throw new Error('Cannot publish because MQTT client is not connected.');
    }

    this.client.publish(topic, message, { retain: true, qos: 2 });
  }

  on(topic: string, callback: (topic: string, message: Buffer) => void): void {
    if (!this.client) {
      throw new Error('Cannot subscribe because MQTT client is not connected.');
    }

    this.client.subscribe(topic, { qos: 2 }, (err) => {
      if (err) {
        console.error(`Failed to subscribe to topic ${topic}:`, err);
      }
    });

    // let currentNode: TopicHandlerTree[string] = { handlers: [], children: {} };
    // topic.split("/").reduce((node, part) => {
    //   node[part] = node[part] ?? { handlers: [], children: {} };
    //   currentNode = node[part];
    //   return node[part].children;
    // }, this.listeners);
    // currentNode.handlers.push(callback);
    this.listeners[topic] = this.listeners[topic] || [];
    this.listeners[topic].push(callback);
  }

  disconnect(): void {
    if (!this.client) {
      throw new Error('Cannot disconnect because MQTT client is not connected.');
    }
    this.client.end();
    this.client = undefined;
  }
}