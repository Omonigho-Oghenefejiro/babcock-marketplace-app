const serializeMeta = (meta) => {
  if (!meta) {
    return '';
  }

  if (typeof meta === 'string') {
    return ` ${meta}`;
  }

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return '';
  }
};

const writeLog = (stream, level, message, meta) => {
  const timestamp = new Date().toISOString();
  stream.write(`[${timestamp}] [${level}] ${message}${serializeMeta(meta)}\n`);
};

const logger = {
  info: (message, meta) => writeLog(process.stdout, 'INFO', message, meta),
  warn: (message, meta) => writeLog(process.stderr, 'WARN', message, meta),
  error: (message, meta) => writeLog(process.stderr, 'ERROR', message, meta),
  http: (message, meta) => {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_HTTP === 'true') {
      writeLog(process.stdout, 'HTTP', message, meta);
    }
  },
};

module.exports = logger;
