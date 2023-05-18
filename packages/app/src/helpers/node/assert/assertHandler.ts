import {NextApiResponse} from "next";
import AssertUpError from "@/interfaces/AssertUpError";
import getLogger from "@/helpers/node/getLogger";
import * as process from "process";

function assertHandler(error: unknown, res?: NextApiResponse, defaultErrorCode = 500) : AssertUpError | undefined {
    // Custom handler to handle custom assert/assertUp errors

    let statusCode = defaultErrorCode;
    let errorMessage = "";

    const logger = getLogger("assert/assertHandler");

    let err = error as Error;

    try {
        const parsedError = JSON.parse(err.message);
        errorMessage = parsedError.message;
        statusCode = parsedError.status;
    }
    catch (_e) {
        logger.error(err.message);
        errorMessage = err.message;
    }

    logger.error(errorMessage);

    const prismaErrorRegex = /prisma/gi;

    process.env.NODE_ENV === "production" && prismaErrorRegex.test(errorMessage) && (statusCode = 500, errorMessage = "Internal Server Error");

    if (res) {
        res.status(statusCode).json({message: errorMessage});
        res.end();
    }
    else {
        return {
            message: errorMessage,
            status: statusCode
        }
    }
}

export default assertHandler;