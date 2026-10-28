type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const payload = {
        level,
        message,
        time: new Date().toISOString(),
        ...meta,
    };
    const line = JSON.stringify(payload);
    if (level === "error") {
        console.error(line);
    } else if (level === "warn") {
        console.warn(line);
    } else {
        console.log(line);
    }
}

export const logger = {
    info: (message: string, meta?: Record<string, unknown>) =>
        write("info", message, meta),
    warn: (message: string, meta?: Record<string, unknown>) =>
        write("warn", message, meta),
    error: (message: string, meta?: Record<string, unknown>) =>
        write("error", message, meta),
};
