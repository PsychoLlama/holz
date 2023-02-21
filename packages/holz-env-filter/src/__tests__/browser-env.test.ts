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

      expect(browser.load()).toBeUndefined();
      localStorage.getItem.mockReturnValue('yolo');
      expect(browser.load()).toBe('yolo');
    });

    it('survives if the localStorage lookup fails', () => {
      const { localStorage } = setup();

      localStorage.getItem.mockImplementation(() => {
        throw new Error('Simulating localStorage DOM exception');
      });

      expect(browser.load()).toBeUndefined();
    });

    it('survives if localStorage is not available', () => {
      expect(browser.load()).toBeUndefined();
    });
  });

  describe('save', () => {
    it('saves the value in localStorage', () => {
      const { localStorage } = setup();

      browser.save('yolo');
      expect(localStorage.setItem).toHaveBeenCalledWith('debug', 'yolo');
    });

    it('survives if localStorage is not available', () => {
      const pass = () => browser.save('no storage');

      expect(pass).not.toThrow();
    });
  });
});
