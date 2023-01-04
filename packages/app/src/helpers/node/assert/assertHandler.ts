import {NextApiResponse} from "next";

function assertHandler(error: unknown, res?: NextApiResponse, defaultErrorCode = 500) {
    // Custom handler to handle custom assert/assertUp errors

    let statusCode = defaultErrorCode;
    let errorMessage = "";

    let err = error as Error;

    try {
        const parsedError = JSON.parse(err.message);
        errorMessage = parsedError.message;
        statusCode = parsedError.status;
    }
    catch (e) {
        let err = e as Error;
        errorMessage = err.message;
    }

    if (res) {
        res.status(statusCode).json({message: errorMessage});
        res.end();
        return;
    }
    else {
        return {
            errorMessage,
            statusCode
        }
    }
}

export default assertHandler;