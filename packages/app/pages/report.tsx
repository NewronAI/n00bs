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



const ReportPage = (props : any) => {

    const {workflows} = props;
    console.log(workflows);

    return (
        <DashboardLayout currentPage={"report"} secondaryNav={<></>}>
            <Loader isLoading={false}>
                <Head>
                    <title>Report</title>
                </Head>

                <div className={"mt-2"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 className={"text-2xl font-bold"}>
                            Report
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Combined report of all the workflows.
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




export const getServerSideProps = withAuthorizedPageAccess({
    getServerSideProps: async (ctx) => {

        const workflows = await db.workflow.findMany({
            select: {
                tasks: {
                    select: {
                        id: true,
                    }
                },
                id: true,
                name: true,
                desc: true,
                uuid: true,
                status: true,

            },
            orderBy: {
                id : "asc"
            }
        });



        const promises = workflows.map(async (workflow) => {

            let id = workflow.id;

            const filesCount = await getFilesCount(id);
            const assignedFilesCount = await getAssignedFilesCount(id);
            const assignedTasksCount = await getAssignedJobsCount(id);
            const pendingTasksCount = await getPendingJobsCount(id);
            const completedTasksCount = await getCompletedJobsCount(id);
            const completedFilesCount = await getCompletedFilesCount(id);

            return {
                filesCount,
                assignedFilesCount,
                assignedTasksCount,
                pendingTasksCount,
                completedTasksCount,
                completedFilesCount,
            }
        });

        const stats = await Promise.all(promises);


        return{
            props: {
                workflows :
                    workflows.map((workflow, index) => {
                        const wfData : any = workflow;
                        console.log(workflow);
                        wfData.stats = stats[index];
                        return wfData;
                })
            }
        }



    },
}, member_role.manager);

export default ReportPage;