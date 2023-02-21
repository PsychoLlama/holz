export const load = (): undefined | string => {
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env.DEBUG;
  }
};

export const save = () => {
  // The effect would be useless. Don't bother.
};
