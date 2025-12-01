import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdaptersFactory } from '../../src/adapters/AdaptersFactory';

vi.mock('../../src/adapters/implementations/MqttPubSub', () => ({
  MqttPubSub: class MockMqttPubSub {
    connect = vi.fn();
    publish = vi.fn();
    on = vi.fn();
    disconnect = vi.fn();
  },
}));

describe('AdaptersFactory', () => {
  beforeEach(() => {
    // Reset static instance
    (AdaptersFactory as any).PubSubINSTANCE = undefined;
    vi.clearAllMocks();
  });

  describe('getPubSub', () => {
    it('should return a PubSub instance', () => {
      const result = AdaptersFactory.getPubSub();

      expect(result).toBeDefined();
      expect(result.connect).toBeDefined();
      expect(result.publish).toBeDefined();
      expect(result.on).toBeDefined();
      expect(result.disconnect).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const instance1 = AdaptersFactory.getPubSub();
      const instance2 = AdaptersFactory.getPubSub();

      expect(instance1).toBe(instance2);
    });
  });
});
