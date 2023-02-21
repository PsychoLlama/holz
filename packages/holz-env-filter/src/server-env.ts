export const load = (key: string): undefined | string => {
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env[key];
  }
};

export const save = () => {
  // The effect would be useless. Don't bother.
};
