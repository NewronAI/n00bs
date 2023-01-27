import React from 'react'
import { NextPage } from 'next'

const BadRequest: NextPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-6xl font-medium">404</h1>
            <p className="text-2xl font-medium pb-3">Page Not Found</p>
            <a href="/" className="mt-4 w-40 md:w-52 btn btn-primary normal-case rounded-lg  font-semibold text-base md:text-lg">Go to Homepage</a>
        </div>
    )
}
export default BadRequest
