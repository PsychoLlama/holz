function ansiCode(code: string) {
  return `\x1b[${code}`;
}

/**
 * Unix only. This will break for win32 terminals and may spew garbage on
 * terminals without 4-bit color support.
 *
 * A smarter module would detect color support. Because this is part of core,
 * any dependencies or platform assumptions could negatively affect other use
 * cases.
 *
 * Really this should be pulled into another library/plugin.
 */

export const color = {
  black: ansiCode('30m'),
  red: ansiCode('31m'),
  green: ansiCode('32m'),
  yellow: ansiCode('33m'),
  blue: ansiCode('34m'),
  magenta: ansiCode('35m'),
  cyan: ansiCode('36m'),
  white: ansiCode('37m'),
};

export const code = {
  reset: ansiCode('0m'),
  bold: ansiCode('1m'),
  dim: ansiCode('2m'),
};
