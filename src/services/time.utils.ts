export const MILLISECONDS_PER_MINUTE = 60_000;

export const minutesToMilliseconds = (minutes: number): number =>
  minutes * MILLISECONDS_PER_MINUTE;

export const MILLISECONDS_PER_DAY = 24 * minutesToMilliseconds(60);

export const isSameTime = (date1: Date, date2: Date): boolean =>
  date1.getTime() === date2.getTime();
