import { parse, matches } from '../string-match';

describe('string-match', () => {
  describe('parse', () => {
    it('parses include patterns', () => {
      expect(parse('  foo,bar baz  , qux  ')).toEqual({
        include: [/^foo$/, /^bar$/, /^baz$/, /^qux$/],
        exclude: [],
      });
    });

    it('detects and groups exclusion patterns', () => {
      expect(parse('first,-second,-third,fourth')).toEqual({
        include: [/^first$/, /^fourth$/],
        exclude: [/^second$/, /^third$/],
      });
    });

    it('converts star patterns to regex wildcards', () => {
      expect(parse('first,second*,split*part')).toEqual({
        include: [/^first$/, /^second.*?$/, /^split.*?part$/],
        exclude: [],
      });
    });
  });

  describe('matches', () => {
    it('returns true if the pattern matches', () => {
      expect(matches(parse('hello'), 'hello')).toBe(true);
    });

    it('returns true if the pattern matches a wildcard', () => {
      expect(matches(parse('hello*'), 'hello world')).toBe(true);
    });

    it('returns false if the pattern does not match', () => {
      expect(matches(parse('hello'), 'bar')).toBe(false);
    });

    it('returns false if the pattern is excluded', () => {
      expect(matches(parse('-hello'), 'hello')).toBe(false);
    });

    it('returns true if the pattern is included', () => {
      expect(matches(parse('hello'), 'hello')).toBe(true);
    });

    it('does not match if there is a contradiction', () => {
      expect(matches(parse('maybe,-maybe'), 'maybe')).toBe(false);
    });

    it('does not match if the filter is empty', () => {
      expect(matches(parse(''), 'content')).toBe(false);
    });
  });
});
