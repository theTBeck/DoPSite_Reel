/* ============================================================
   CINE BECK — Logger Module
   Structured logging with levels
   ============================================================ */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLevel = LOG_LEVELS[localStorage.getItem('cinebeck:logLevel')] ?? LOG_LEVELS.info;

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return meta && Object.keys(meta).length 
    ? `${prefix} ${message} ${JSON.stringify(meta)}`
    : `${prefix} ${message}`;
}

export const log = {
  debug(message, meta) {
    if (currentLevel <= LOG_LEVELS.debug) console.debug(formatMessage('debug', message, meta));
  },
  info(message, meta) {
    if (currentLevel <= LOG_LEVELS.info) console.info(formatMessage('info', message, meta));
  },
  warn(message, meta) {
    if (currentLevel <= LOG_LEVELS.warn) console.warn(formatMessage('warn', message, meta));
  },
  error(message, meta) {
    if (currentLevel <= LOG_LEVELS.error) console.error(formatMessage('error', message, meta));
  },
  
  // Video-specific structured logging
  videoEvent(event, videoEl, meta = {}) {
    this.debug(`video:${event}`, {
      src: videoEl?.src,
      currentTime: videoEl?.currentTime,
      duration: videoEl?.duration,
      paused: videoEl?.paused,
      muted: videoEl?.muted,
      volume: videoEl?.volume,
      readyState: videoEl?.readyState,
      networkState: videoEl?.networkState,
      error: videoEl?.error?.code,
      ...meta
    });
  }
};

export function setLogLevel(level) {
  if (LOG_LEVELS[level] !== undefined) {
    localStorage.setItem('cinebeck:logLevel', level);
    location.reload();
  }
}