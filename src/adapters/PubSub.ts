export interface PubSub {
  connect(brokerUrl: string): Promise<void>;
  publish(topic: string, message: string | Buffer, options?: object): void;
  on(topic: string, callback: (topic: string, message: Buffer) => void): void;
  disconnect(): void;
}