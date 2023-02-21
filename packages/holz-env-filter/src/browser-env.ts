const STORAGE_KEY = 'debug';

export const load = (): undefined | string => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) ?? undefined;
    }
  } catch (error) {
    // Sometimes localStorage fails (e.g. in Safari private mode). That's
    // okay.
  }
};

export const save = (pattern: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, pattern);
    }
  } catch (error) {
    // Throwing might break a startup script. Don't do that.
  }
};
