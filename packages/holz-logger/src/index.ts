import { createLogger } from '@holz/core';
import type { Logger } from '@holz/core';
import { processor } from '#processor';

const logger: Logger = createLogger(processor);

export default logger;
