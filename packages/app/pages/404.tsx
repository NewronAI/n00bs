import React from 'react'
import { NextPage } from 'next'


const BadRequest: NextPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-4xl mb-5 font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-7xl">Page not found.</h1>
            <h1 className="text-4xl mb-5 font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-7xl">Sorry, we couldn’t find the page you’re looking for.</h1>
            <a href="/" className="mt-5 w-40 md:w-52 btn btn-primary normal-case rounded-lg  font-semibold text-base md:text-lg">Go to Homepage</a>
        </div>
    )
}
export default BadRequest
