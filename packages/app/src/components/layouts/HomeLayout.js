import React from 'react';
import Link from "next/link";
import clsx from "clsx";

const MainLayout = ({stickyHeader,children,footer, enforceWidthRestraint = true}) => {


    return (
        <div className={"pt-1 "} >
            <div className={"flex flex-col gap-2 items-center"}>
                <nav className={clsx("max-w-7xl w-full pb-2 z-10 dark:border-zinc-800 px-2",
                    // "border-b border-zinc-200 ",
                    {"sticky top-0 bg-white dark:bg-black": stickyHeader},

                )}>
                    <div className={"w-full flex justify-between"}>
                        <div className={"flex gap-2"}>
                            {/* Logo Side*/}
                            <div className={"flex gap-2 items-center rounded-full"}>
                                    {/*<Image src={vinciImage} alt={"Da Vinci"} width={50} height={50} className={"rounded-full "}/>*/}
                                <Link href={"/"}>
                                    <h1 className={"text-xl tracking-wider font-bold"}>
                                        <span className={"bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent"}>
                                            noOBS
                                        </span>
                                    {/*<span className={"text-green-500"} >fresh</span>Ink*/}
                                    </h1>
                                    {/*<div className={"h-6 bg-gray-800 dark:bg-gray-200 inline-block blink-around -mb-1"} style={{width: 2}}/>*/}
                                </Link>
                                <span className={"text-xs mt-2 text-gray-500 sr-only"}>
                                by <Link href="https://newron.ai">Newron.ai</Link>
                            </span>
                            </div>
                        </div>
                        <div className={clsx("flex gap-5")}>
                            {/*  Navcontrol side  */}
                            {/*<Suspense fallback={<>...</>} >*/}
                            {/*    <ThemeSelector />*/}
                            {/*</Suspense>*/}
                        </div>
                    </div>
                </nav>
                <div className={clsx("w-full",  {"max-w-7xl": enforceWidthRestraint})}>
                        {children}
                    {footer}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
