import React from 'react'

function ServerError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-6xl font-medium">500 - Internal Server Error</h1>
            <p className="text-2xl font-medium pb-3">Something went wrong on our end. Please try again later.</p>
            <a href="/" className="mt-4 w-40 md:w-52 btn btn-primary normal-case rounded-lg  font-semibold text-base md:text-lg">Go to Homepage</a>
        </div>
    )
}

export default ServerError