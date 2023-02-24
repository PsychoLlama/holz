function ansiCode(code: string) {
  return `\x1b[${code}`;
}

/**
 * Assumes 3-bit color support for an ANSI terminal. This should work on most
 * modern terminals, including on Windows.
 */

export const reset = ansiCode('0m');
export const bold = ansiCode('1m');
export const dim = ansiCode('2m');

export const black = ansiCode('30m');
export const red = ansiCode('31m');
export const green = ansiCode('32m');
export const yellow = ansiCode('33m');
export const blue = ansiCode('34m');
export const magenta = ansiCode('35m');
export const cyan = ansiCode('36m');
export const white = ansiCode('37m');
