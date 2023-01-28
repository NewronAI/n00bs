import React from 'react'
import { NextPage } from 'next'
import Link from "next/link";

const BadRequest: NextPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="mt-2 text-6xl font-bold mb-2 tracking-tight sm:text-5xl">Page not found.</h1>
            <h1 className="text-6xl font-bold mb-3">Sorry, we couldn’t find the page you’re looking for.</h1>
            <Link href="/" className="mt-4 w-40 md:w-52 btn btn-primary normal-case rounded-lg  font-semibold text-base md:text-lg">Go to Homepage</Link>
        </div>
    )
}
export default BadRequest
