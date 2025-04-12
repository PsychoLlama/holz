import * as env from '../get-env';

class MockLocalStorage {
  private store = new Map<string, string>();

  getItem = vi.fn((key: string) => this.store.get(key) ?? null);
  setItem = vi.fn((key: string, value: string) => {
    this.store.set(key, value);
  });
}

describe('environment', () => {
  describe('getLocalStorageKey', () => {
    const STORAGE_KEY = 'test-key';

    const setup = () => {
      const localStorage = new MockLocalStorage();

      Object.assign(globalThis, { localStorage });

      return {
        localStorage,
      };
    };

    beforeEach(() => {
      Object.assign(globalThis, { localStorage: undefined });
    });

    describe('getLocalStorageKey', () => {
      it('returns the value stored in localStorage, or undefined', () => {
        const { localStorage } = setup();

        expect(env.getLocalStorageKey(STORAGE_KEY)).toBeUndefined();
        localStorage.setItem(STORAGE_KEY, 'yolo');
        expect(env.getLocalStorageKey(STORAGE_KEY)).toBe('yolo');
      });

      it('survives if the localStorage lookup fails', () => {
        const { localStorage } = setup();

        localStorage.getItem.mockImplementation(() => {
          throw new Error('Simulating localStorage DOM exception');
        });

        expect(env.getLocalStorageKey(STORAGE_KEY)).toBeUndefined();
      });

      it('survives if localStorage is not available', () => {
        expect(env.getLocalStorageKey(STORAGE_KEY)).toBeUndefined();
      });
    });
  });

  describe('getEnvVariable', () => {
    const ENV_KEY = 'HOLZ_DEBUG_TEST_PATTERN';

    beforeEach(() => {
      delete process.env[ENV_KEY];
    });

    it('returns the value stored in process.env', () => {
      expect(env.getEnvironmentVariable(ENV_KEY)).toBeUndefined();
      process.env[ENV_KEY] = '-stuff:*';
      expect(env.getEnvironmentVariable(ENV_KEY)).toBe('-stuff:*');
    });
  });
});
