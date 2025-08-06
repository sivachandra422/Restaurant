import { EventEmitter } from 'events';

const sseEventEmitter = new EventEmitter();

// Increase max listeners to prevent warnings
sseEventEmitter.setMaxListeners(100);

// Add cleanup method to remove all listeners
(sseEventEmitter as any).cleanup = () => {
  sseEventEmitter.removeAllListeners();
};

export default sseEventEmitter; 