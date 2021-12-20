import { IS_TEST_ENV } from '../config';

const disabledLogger: Pick<typeof console, 'log' | 'warn' | 'error'> = {
  log: () => {},
  warn: () => {},
  error: () => {},
};

const logger = console;

export default IS_TEST_ENV ? disabledLogger : logger;
