import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MqttPubSub } from '../../../src/adapters/implementations/MqttPubSub';
import mqtt from 'mqtt';

vi.mock('mqtt');

describe('MqttPubSub', () => {
  let mqttPubSub: MqttPubSub;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      connected: false,
      on: vi.fn(),
      publish: vi.fn(),
      subscribe: vi.fn(),
      end: vi.fn(),
      reconnect: vi.fn(),
    };

    vi.mocked(mqtt.connect).mockReturnValue(mockClient as any);
    mqttPubSub = new MqttPubSub();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to MQTT broker', async () => {
      const connectPromise = mqttPubSub.connect('mqtt://localhost:1883');

      // Simulate successful connection
      const connectHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();

      await connectPromise;

      expect(mqtt.connect).toHaveBeenCalledWith('mqtt://localhost:1883', {
        clientId: 'BackendService',
      });
      expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('should not reconnect if already connected', async () => {
      // First connect
      const connectPromise = mqttPubSub.connect('mqtt://localhost:1883');
      const connectHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;

      mockClient.connected = true;

      // Try to connect again
      await mqttPubSub.connect('mqtt://localhost:1883');

      // Should have been called only once (from the first connect)
      expect(mqtt.connect).toHaveBeenCalledTimes(1);
    });

    it('should reject on connection error', async () => {
      const connectPromise = mqttPubSub.connect('mqtt://localhost:1883');

      // Simulate connection error
      const errorHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'error')[1];
      errorHandler(new Error('Connection failed'));

      await expect(connectPromise).rejects.toThrow('Connection failed');
    });

    it('should handle messages', async () => {
      const connectPromise = mqttPubSub.connect('mqtt://localhost:1883');

      const connectHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();

      await connectPromise;

      const messageHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'message')[1];
      const callback = vi.fn();

      mockClient.subscribe.mockImplementation((_topic: string, _options: any, cb: Function) => {
        cb(null);
      });

      mqttPubSub.on('test/topic', callback);

      const message = Buffer.from('test message');
      messageHandler('test/topic', message, { retain: false });

      expect(callback).toHaveBeenCalledWith('test/topic', message);
    });

    it('should not handle retained messages', async () => {
      const connectPromise = mqttPubSub.connect('mqtt://localhost:1883');

      const connectHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();

      await connectPromise;

      const messageHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'message')[1];
      const callback = vi.fn();

      mockClient.subscribe.mockImplementation((_topic: string, _options: any, cb: Function) => {
        cb(null);
      });

      mqttPubSub.on('test/topic', callback);

      const message = Buffer.from('test message');
      messageHandler('test/topic', message, { retain: true });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle disconnect event', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      const connectPromise = mqttPubSub.connect('mqtt://localhost:1883');

      const connectHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();

      await connectPromise;

      const disconnectHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'disconnect')[1];
      disconnectHandler();

      expect(consoleSpy).toHaveBeenCalledWith('MQTT client disconnected. Attempting to reconnect...');
      expect(mockClient.reconnect).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('publish', () => {
    beforeEach(async () => {
      const connectPromise = mqttPubSub.connect('mqtt://localhost:1883');
      const connectHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;
    });

    it('should publish message to topic', () => {
      mqttPubSub.publish('test/topic', 'test message');

      expect(mockClient.publish).toHaveBeenCalledWith(
        'test/topic',
        'test message',
        { retain: true, qos: 2 }
      );
    });

    it('should publish buffer message', () => {
      const buffer = Buffer.from('test message');
      mqttPubSub.publish('test/topic', buffer);

      expect(mockClient.publish).toHaveBeenCalledWith(
        'test/topic',
        buffer,
        { retain: true, qos: 2 }
      );
    });

    it('should throw error if client is not connected', () => {
      const newPubSub = new MqttPubSub();

      expect(() => {
        newPubSub.publish('test/topic', 'message');
      }).toThrow('Cannot publish because MQTT client is not connected.');
    });
  });

  describe('on', () => {
    beforeEach(async () => {
      const connectPromise = mqttPubSub.connect('mqtt://localhost:1883');
      const connectHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;
    });

    it('should subscribe to topic', () => {
      const callback = vi.fn();

      mockClient.subscribe.mockImplementation((_topic: string, _options: any, cb: Function) => {
        cb(null);
      });

      mqttPubSub.on('test/topic', callback);

      expect(mockClient.subscribe).toHaveBeenCalledWith(
        'test/topic',
        { qos: 2 },
        expect.any(Function)
      );
    });

    it('should handle subscription error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      const callback = vi.fn();

      mockClient.subscribe.mockImplementation((_topic: string, _options: any, cb: Function) => {
        cb(new Error('Subscription failed'));
      });

      mqttPubSub.on('test/topic', callback);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to subscribe to topic test/topic:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should throw error if client is not connected', () => {
      const newPubSub = new MqttPubSub();

      expect(() => {
        newPubSub.on('test/topic', () => { });
      }).toThrow('Cannot subscribe because MQTT client is not connected.');
    });

    it('should support multiple callbacks for the same topic', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      mockClient.subscribe.mockImplementation((_topic: string, _options: any, cb: Function) => {
        cb(null);
      });

      mqttPubSub.on('test/topic', callback1);
      mqttPubSub.on('test/topic', callback2);

      const messageHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'message')[1];
      const message = Buffer.from('test message');
      messageHandler('test/topic', message, { retain: false });

      expect(callback1).toHaveBeenCalledWith('test/topic', message);
      expect(callback2).toHaveBeenCalledWith('test/topic', message);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from MQTT broker', async () => {
      const connectPromise = mqttPubSub.connect('mqtt://localhost:1883');
      const connectHandler = mockClient.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      connectHandler();
      await connectPromise;

      mqttPubSub.disconnect();

      expect(mockClient.end).toHaveBeenCalled();
    });

    it('should throw error if client is not connected', () => {
      expect(() => {
        mqttPubSub.disconnect();
      }).toThrow('Cannot disconnect because MQTT client is not connected.');
    });
  });
});
