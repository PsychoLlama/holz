export const getEnvironmentVariable = (key: string): undefined | string => {
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env[key];
  }
};

export const getLocalStorageKey = (key: string): undefined | string => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) ?? undefined;
    }
  } catch {
    // Sometimes localStorage fails (e.g. in Safari private mode). That's
    // okay. We'll just use a fallback pattern.
  }
};
