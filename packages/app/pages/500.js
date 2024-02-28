import Link from "next/link";

export default function ServerError() {

    return (
            <div className="flex min-h-full flex-col pt-16 pb-12">
                <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-shrink-0 justify-center">
                        <Link href="/" className="inline-flex">
                            <span className="sr-only">{"Bhasha"}</span>
                            {/*<img*/}
                            {/*    className="h-12 w-auto"*/}
                            {/*    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"*/}
                            {/*    alt=""*/}
                            {/*/>*/}
                        </Link>
                    </div>
                    <div className="py-16">
                        <div className="text-center">
                            <p className="text-base font-semibold text-orange-600">500</p>
                            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">Something went wrong</h1>
                            <p className="mt-2 text-base text-gray-500">Whoops! you were not supposed to see this ever. Please contact admin if it keeps happening.</p>
                            <div className="mt-6">
                                <Link href="/" className="text-base font-medium text-gradient">
                                    <span aria-hidden="true"> &larr; </span>
                                    Go back home
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

    )
}
