export const STORAGE_KEY = 'debug';

export const load = (key: string): undefined | string => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) ?? undefined;
    }
  } catch (error) {
    // Sometimes localStorage fails (e.g. in Safari private mode). That's
    // okay.
  }
};

export const save = (key: string, pattern: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, pattern);
    }
  } catch (error) {
    // Throwing might break a startup script. Don't do that.
  }
};
