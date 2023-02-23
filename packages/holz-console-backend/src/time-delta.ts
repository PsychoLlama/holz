const second = 1_000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

/**
 * Formats the difference between two dates in human-readable time.
 *
 * Inspired by the `ms` package. Thanks TJ.
 */
export const timeDelta = (now: Date, then: Date = now) => {
  const offset = now.getTime() - then.getTime();
  const distance = Math.abs(offset);
  const sign = offset < 0 ? '' : '+';

  if (distance >= day) {
    return `${sign}${Math.round(offset / day)}d`;
  }

  if (distance >= hour) {
    return `${sign}${Math.round(offset / hour)}h`;
  }

  if (distance >= minute) {
    return `${sign}${Math.round(offset / minute)}m`;
  }

  if (distance >= second) {
    return `${sign}${Math.round(offset / second)}s`;
  }

  return `${sign}${offset}ms`;
};
