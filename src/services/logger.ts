import { IS_TEST_ENV } from '../config';

const disabledLogger: Pick<typeof console, 'debug' | 'log' | 'warn' | 'error'> =
  {
    debug: () => {},
    log: () => {},
    warn: () => {},
    error: () => {},
  };

const logger = console;

export default IS_TEST_ENV ? disabledLogger : logger;
