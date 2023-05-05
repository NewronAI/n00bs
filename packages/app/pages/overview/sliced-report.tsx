import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from "next/head";
import { member_role } from "@prisma/client";
import Loader from '@/components/Loader';
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import {db} from "@/helpers/node/db";
import {
    getAssignedFilesCount,
    getAssignedJobsCount, getCompletedFilesCount, getCompletedJobsCount,
    getFilesCount,
    getPendingJobsCount
} from "@/helpers/node/worflowStats";
import { useState } from 'react';

const tabs = [
    {name: "Report", href: "/overview/report"},
    {name: "Delivery View", href: "/overview/delivery_view"}
]

const SecNav = () => {

    const [currentPage, setCurrentPage] = useState("Report")

    return (
        <div className="flex flex-grow flex-col overflow-y-auto  border-r border-gray-800 pt-5 pb-4 min-w-[200px]">
            <div className="mt-5 flex flex-grow flex-col">
                <nav className="flex-1 space-y-1 px-2" aria-label="Sidebar">
                    {tabs.map((item) => (
                            <div key={item.name}>
                            <a
                                className={'text-gray-300 hover:bg-gray-50 hover:text-gray-900 group flex w-full items-center rounded-md py-2 pl-7 pr-5 text-sm font-medium'}
                                href={item.href}
                            >
                                {item.name}
                            </a>
                        </div>
                        )
                    )}
                </nav>
            </div>
        </div>
    )
}

const ReportPage = (props : any) => {

    const {workflows} = props;
    console.log(workflows);

    return (
        <DashboardLayout currentPage={"report"} secondaryNav={<SecNav />}>
            <Loader isLoading={false}>
                <Head>
                    <title>Sliced Report</title>
                </Head>

                <div className={"mt-2"}>
                    <div className={"p-0 mb-4 md:pl-4"}>
                        <h1 className={"text-2xl font-bold"}>
                           Sliced Report
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Combined report of all the workflows but sliced.
                        </p>
                    </div>
                    {
                        workflows.map((wf : any) => {
                            const statsKeys = Object.keys(wf.stats);
                            return <div key={wf.uuid} className={"p-0 md:pl-4"}>
                                <div className={"mt-8"}>
                                    <h2 className={"text-lg font-semibold"}>
                                        {wf.name}
                                    </h2>
                                    <p>{wf.desc}</p>
                                </div>
                                <div className='grid grid-cols-4 gap-7 justify-center items-center mt-10 border-hidden'>
                                    {
                                        statsKeys.map((key : string) => {
                                            return <div key={key} className='text-center rounded-xl text-3xl bg-zinc-900 p-7 shadow-xl'>
                                                {wf.stats[key]}
                                                <p className='text-lg font-bold capitalize'>
                                                    {key.replaceAll(/([A-Z])/g," $1" )}
                                                </p>
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                        })
                    }
                </div>
            </Loader>
        </DashboardLayout>
    );
};

export default ReportPage;
