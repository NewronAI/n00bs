import {NextApiResponse} from "next";

function assertHandler(error: Error, res?: NextApiResponse, defaultErrorCode = 500) {
    let statusCode = defaultErrorCode;
    let errorMessage = "";

    try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.message;
        statusCode = parsedError.status;
    }
    catch (e) {
        errorMessage = error.message;
    }

    if (res) {
        res.status(statusCode).json({message: errorMessage});
        res.end();
    }
    else {
        return {
            errorMessage,
            statusCode
        }
    }
}

export default assertHandler;