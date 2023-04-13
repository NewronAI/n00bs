import Link from "next/link";
import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)

        // Define a state variable to track whether is an error or not
        this.state = { hasError: false }
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI

        return { hasError: true , errorMessage : error.errorText}
    }
    componentDidCatch(error, errorInfo) {
        // You can use your own error logging service here
        console.error({ error, errorInfo })
    }
    render() {
        // Check if the error is thrown
        if (this.state.hasError && process.env.NODE_ENV === "production") {
            // You can render any custom fallback UI
            return (
                <div className="h-screen bg-white min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
                    <div className="max-w-max mx-auto">
                        <main className="sm:flex">
                            <p className="text-4xl tracking-tight font-bold text-indigo-600 sm:text-5xl">Oh! Snap</p>
                            <div className="sm:ml-6">
                                <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">An unexpected error occurred</h1>
                                    <p className="mt-1 text-base text-gray-500">{this.state.errorMessage || "Something went wrong in the application. "}</p>
                                </div>
                                <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                                    <Link href="/workflows">
                                        <span
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                          Go back home
                                        </span>
                                    </Link>
                                    <Link href="mailto:shubham@artpark.in">
                  <span
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Contact support
                  </span>
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            )
        }

        // Return children components in case of no error

        return this.props.children
    }
}

export default ErrorBoundary
