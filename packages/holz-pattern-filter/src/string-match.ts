/**
 * Parse a string of multiple patterns into a set of regular expressions. We
 * use a pattern string (instead of regexes) because it's easier to persist in
 * storage or specify through a CLI.
 *
 * Special thanks to `debug-js` for the inspiration. I read their code as
 * a guide for this implementation.
 */
export const parse = (input: string): PatternFilters => {
  const patterns = input.split(/[\s,]+/).filter(Boolean);

  return patterns.reduce<PatternFilters>(
    (groups, pattern) => {
      if (pattern[0] === '-') {
        groups.exclude.push(toRegex(pattern.slice(1)));
      } else {
        groups.include.push(toRegex(pattern));
      }

      return groups;
    },
    { include: [], exclude: [] },
  );
};

/** Detect if a string matches a set of patterns. */
export const matches = (filters: PatternFilters, input: string): boolean => {
  return (
    filters.exclude.every((pattern) => !pattern.test(input)) &&
    filters.include.some((pattern) => pattern.test(input))
  );
};

const toRegex = (pattern: string): RegExp => {
  const regex = pattern.replace(/\*/g, '.*?');
  return new RegExp(`^${regex}$`);
};

interface PatternFilters {
  include: Array<RegExp>;
  exclude: Array<RegExp>;
}
