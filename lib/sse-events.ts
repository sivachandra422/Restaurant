import { EventEmitter } from 'events';

class SSEManager extends EventEmitter {
  private maxListeners = 100;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setMaxListeners(this.maxListeners);
    this.startCleanupInterval();
  }

  private startCleanupInterval() {
    // Clean up listeners every 5 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      const listenerCount = this.listenerCount('order-event');
      if (listenerCount > this.maxListeners * 0.8) {
        console.log(`SSE: High listener count (${listenerCount}), cleaning up...`);
        this.removeAllListeners('order-event');
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  public cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.removeAllListeners();
  }

  public emit(event: string, ...args: any[]): boolean {
    // Add logging for debugging
    if (event === 'order-event') {
      console.log(`SSE: Emitting ${event} to ${this.listenerCount(event)} listeners`);
    }
    return super.emit(event, ...args);
  }
}

const sseEventEmitter = new SSEManager();

export default sseEventEmitter; 