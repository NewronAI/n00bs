import pino, {Logger} from "pino";
import logLevelData from "../../constants/common/logLevelData";


const logLevels = new Map<string, string>(Object.entries(logLevelData));


export function getLogLevel(logger: string): string {
    return logLevels.get(logger) || logLevels.get("*") || "info";
}

function getLogger(name: string, logLevel?: string): Logger {
    return pino({ name, level: logLevel || getLogLevel(name) });
}

export default getLogger;