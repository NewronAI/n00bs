// Stores the mapping of log level to log level name
// Compare this snippet from packages/app/src/helpers/node/getLogger.ts:


const logLevelData = {
    "*": "info",
    "app": process.env.NODE_ENV === "production" ? "silent" : "debug",
    "api": "debug"
}

export default logLevelData;