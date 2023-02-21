import * as browserEnv from './browser-env';
import * as serverEnv from './server-env';

/**
 * Detect Electron renderer / nwjs processes, which are node, but we should
 * treat them as a browser.
 *
 * Credit: debug-js
 */
export const detectEnvironment = (process: unknown) => {
  return typeof process === 'undefined' ||
    Object(process).type === 'renderer' ||
    Object(process).browser === true ||
    Object(process).__nwjs
    ? browserEnv
    : serverEnv;
};
