import path from 'path';
import dotenv from 'dotenv';
import Logger from './logger';

const logger = Logger('src/dotenvProxy.ts');

interface IOError extends Error {
  code?: string;
}

let isInvoked = false;

export default (): void => {
  if (isInvoked) {
    return;
  }
  isInvoked = true;
  const envFilePath = path.resolve(__dirname, '../.env');
  const dotParsingResult = dotenv.config({ path: envFilePath });

  if (dotParsingResult.error) {
    if ((dotParsingResult.error as IOError).code === 'ENOENT') {
      logger.debug('Environment file do not exist. Skipping.');
    } else {
      logger.warn(
        'Unexpected dotenv: (%s)',
        JSON.stringify(dotParsingResult.error)
      );
    }
  }
};
