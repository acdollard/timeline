class Logger {
  isProduction = true;
  log(level, message, context, userId) {
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      message,
      context,
      userId
    };
    if (this.isProduction) {
      this.sendToLoggingService(entry);
    } else {
      console[level](message, context);
    }
  }
  sendToLoggingService(entry) {
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    }).catch((err) => console.error("Failed to send log:", err));
  }
  debug(message, context, userId) {
    this.log("debug", message, context, userId);
  }
  info(message, context, userId) {
    this.log("info", message, context, userId);
  }
  warn(message, context, userId) {
    this.log("warn", message, context, userId);
  }
  error(message, context, userId) {
    this.log("error", message, context, userId);
  }
}
const logger = new Logger();

export { logger as l };
