import * as browser from '../browser-env';

class MockLocalStorage {
  getItem = vi.fn((): null | string => null);
  setItem = vi.fn();
}

describe('Browser environment', () => {
  function setup() {
    const localStorage = new MockLocalStorage();

    Object.assign(globalThis, { localStorage });

    return {
      localStorage,
    };
  }

  beforeEach(() => {
    Object.assign(globalThis, { localStorage: undefined });
  });

  describe('load', () => {
    it('returns the value stored in localStorage, or undefined', () => {
      const { localStorage } = setup();

      expect(browser.load(browser.STORAGE_KEY)).toBeUndefined();
      localStorage.getItem.mockReturnValue('yolo');
      expect(browser.load(browser.STORAGE_KEY)).toBe('yolo');
    });

    it('survives if the localStorage lookup fails', () => {
      const { localStorage } = setup();

      localStorage.getItem.mockImplementation(() => {
        throw new Error('Simulating localStorage DOM exception');
      });

      expect(browser.load(browser.STORAGE_KEY)).toBeUndefined();
    });

    it('survives if localStorage is not available', () => {
      expect(browser.load(browser.STORAGE_KEY)).toBeUndefined();
    });
  });

  describe('save', () => {
    it('saves the value in localStorage', () => {
      const { localStorage } = setup();

      browser.save(browser.STORAGE_KEY, 'yolo');
      expect(localStorage.setItem).toHaveBeenCalledWith('debug', 'yolo');
    });

    it('survives if localStorage is not available', () => {
      const pass = () => browser.save(browser.STORAGE_KEY, 'no storage');

      expect(pass).not.toThrow();
    });
  });
});
