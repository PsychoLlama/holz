const ansiCode = (code: string) => `\x1b[${code}`;

/**
 * Assumes 3-bit color support for an ANSI terminal. This should work on most
 * modern terminals, including on Windows.
 */

export const reset: string = ansiCode('0m');
export const bold: string = ansiCode('1m');
export const dim: string = ansiCode('2m');

export const red: string = ansiCode('31m');
export const green: string = ansiCode('32m');
export const yellow: string = ansiCode('33m');
export const blue: string = ansiCode('34m');
export const brightWhite: string = ansiCode('97m');
