import type { LogProcessor } from '../types';

export default class TestBackend implements LogProcessor {
  processLog = vi.fn();
}
