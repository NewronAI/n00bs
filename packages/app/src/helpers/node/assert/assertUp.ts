import assert from "assert";

function assertUp (truthy : unknown, error : object) : asserts truthy {
    return assert(truthy, JSON.stringify(error));
}

export default assertUp;