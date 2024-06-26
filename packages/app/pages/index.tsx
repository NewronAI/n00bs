import Head from 'next/head'
// import Image from 'next/image'
// import { Inter } from '@next/font/google'
import React from "react";
import Link from "next/link";
import HomeLayout from "@/components/layouts/HomeLayout";


// const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    return (
        <HomeLayout stickyHeader={false} enforceWidthRestraint={true} footer={<></>} >
            <Head>
                <title>Artpark: Quality Control</title>
                <meta name="description" content="Quality Control for mass collected files Artpark" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={"flex justify-center text-center "}>
                <div className=" mt-8 md:mt-16 flex justify-center">
                    <div className={"flex justify-between max-w-7xl w-full"}>
                        <div className="max-w-2xl md:mt-16">
                            <h1 className="text-4xl font-bold tracking-tight  dark:text-zinc-700 sm:text-7xl">
                                {/* Data quality control?
                                Here is the solution. */}
                                <span className={"text-orange-500"}>
                                    Bhasha <span className='text-green-600'>Setu</span>
                                </span>
                            </h1>
                            <p className="mt-6 text-base text-zinc-600 dark:text-zinc-600">
                                Get saved from doing hours of repetitive work. No more copy-pasting between sheets, no more manual calculations, no more manual data entry. Let us do the work for you.
                            </p>
                            <Link href={"/api/auth/login"}>
                                <button className={"mt-4 w-40 md:w-52 btn btn-primary normal-case rounded-lg  font-semibold text-base md:text-lg"}>
                                    Get Started
                                </button>
                            </Link>
                        </div>
                        {/*<div className={"flex justify-between hidden lg:block"}>*/}
                        {/*    /!*<div*!/*/}
                        {/*    /!*    className={clsx(*!/*/}
                        {/*    /!*        ' aspect-[9/10] w-60  sm:w-72  rotate-2')}*!/*/}
                        {/*    /!*>*!/*/}
                        {/*    <Image*/}
                        {/*        src={posts}*/}
                        {/*        alt={`posts generated by ${setup.projectName}`}*/}
                        {/*        width={500}*/}
                        {/*        height={500}*/}
                        {/*        priority*/}
                        {/*        sizes="(min-width: 640px) 25rem, 18rem"*/}
                        {/*        className="h-full w-full object-cover"*/}
                        {/*    />*/}
                        {/*</div>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </main>
        </HomeLayout>
    )
}
