const disabledLogger = {
  log: () => {},
};

const logger = console;

export default process.env.NODE_ENV === 'test' ? disabledLogger : logger;
