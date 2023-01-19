import assert from "assert";

interface ErrorObject {
    message : string;
    status : number;
}

function assertUp (truthy : unknown, error : ErrorObject) : asserts truthy {
    return assert(truthy, JSON.stringify(error));
}

export default assertUp;