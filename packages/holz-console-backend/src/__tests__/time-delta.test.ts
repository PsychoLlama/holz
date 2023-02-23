import { timeDelta } from '../time-delta';

describe('timeDelta', () => {
  it('formats the difference in human-readable time', () => {
    expect(timeDelta(new Date(0), new Date(0))).toBe('+0ms');
    expect(timeDelta(new Date(1), new Date(0))).toBe('+1ms');
    expect(timeDelta(new Date(999), new Date(0))).toBe('+999ms');
    expect(timeDelta(new Date(1_000), new Date(0))).toBe('+1s');

    expect(timeDelta(new Date(1_499), new Date(0))).toBe('+1s');
    expect(timeDelta(new Date(1_500), new Date(0))).toBe('+2s');

    // Not quite a full minute. Kinda weird, but only if you think about it.
    expect(timeDelta(new Date(59_999), new Date(0))).toBe('+60s');

    expect(timeDelta(new Date(60_000), new Date(0))).toBe('+1m');
    expect(timeDelta(new Date(3_600_000), new Date(0))).toBe('+1h');
    expect(timeDelta(new Date(86_400_000), new Date(0))).toBe('+1d');
  });

  it('uses the current time if the last point is unknown', () => {
    expect(timeDelta(new Date(0))).toBe('+0ms');
  });

  it('handles negative time differences', () => {
    expect(timeDelta(new Date(0), new Date(1))).toBe('-1ms');
    expect(timeDelta(new Date(0), new Date(60_000))).toBe('-1m');
  });
});
