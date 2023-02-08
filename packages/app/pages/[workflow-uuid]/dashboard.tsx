import React from 'react';
import Head from "next/head";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import WorkflowNav from "@/components/layouts/WorkflowNav";
import {member_role, obj_status} from "@prisma/client";
import {db} from "@/helpers/node/db";
import WorkflowItem from "@/interfaces/WorkflowItem";
import IngestFilesDoc from "@/components/IngestFilesDoc";
import HandleCopy from "@/components/HandleCopy";
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";

import useSWR from 'swr'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import Loader from '@/components/Loader';

interface DashboardProps {
    workflow: WorkflowItem;
}

// This page is server side rendered
const DashboardPage = (props: DashboardProps) => {

    const workflow: WorkflowItem = props.workflow as WorkflowItem;
    const workflowUUID = workflow.uuid;


    const { data, error, isLoading } = useSWR(`/api/v1/${workflowUUID}/public/stats/dashboard`, (url) => fetch(url).then(res => res.json()));
    const file = data || []
    console.log(file);
    if (error) return <div>Failed to load data</div>;



    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"dashboard"} workflowUUID={workflowUUID} />}>
            <Head>
                <title>{workflow.name}</title>
            </Head>

            <Loader isLoading={isLoading}>
            <div>
                {file.filesCount === 0 ?
                    <div>
                        <div className={"mt-2 flex justify-between"}>
                            <div className={"p-0 md:pl-4"}>
                                <h1 className={"text-2xl font-bold"}>
                                    {workflow?.name}
                                </h1>
                                <p className={"font-thin text-sm"}>
                                    {workflow?.desc}
                                </p>
                            </div>
                            <div className={"flex items-center"}>
                                <span className={"text-sm mr-2 "}>
                                    {workflowUUID}
                                </span>

                                <HandleCopy text={workflowUUID || ""} />
                            </div>
                        </div>
                        <div>
                            <IngestFilesDoc workflowUUID={workflowUUID} />
                        </div>
                    </div>
                    :
                    <div className='container mx-auto items-center'>
                        <div className={"mt-2 flex justify-between"}>
                            <div className={"p-0 md:pl-4"}>
                                <h1 className={"text-2xl font-bold"}>
                                    {workflow?.name}
                                </h1>
                                <p className={"font-thin text-sm"}>
                                    {workflow?.desc}
                                </p>
                            </div>
                            <div className={"flex items-center"}>
                                <span className={"text-sm mr-2 "}>
                                    {workflowUUID}
                                </span>
                                <HandleCopy text={workflowUUID || ""} />
                            </div>
                        </div>

                        <div className='grid grid-cols-4 gap-7 justify-center items-center mt-10 border-hidden'>
                            <div className='text-center rounded-xl text-3xl bg-zinc-900 p-7 shadow-xl'>{file.filesCount}<p className='text-lg font-bold'>Total Files</p></div>
                            <div className='text-center rounded-xl text-3xl bg-zinc-900 p-7 shadow-xl'>{file.assignedFilesCount}<p className='text-lg font-bold'>Total Assigned Files</p></div>
                            <div className='text-center rounded-xl text-3xl bg-zinc-900 p-7 shadow-xl'>{file.assignedJobsCount}<p className='text-lg font-bold'>Total Assigned Jobs</p></div>
                            <div className='text-center rounded-xl text-3xl bg-zinc-900 p-7 shadow-xl'>{file.pendingJobsCount}<p className='text-lg font-bold'>Total Pending Jobs</p></div>
                            <div className='text-center rounded-xl text-3xl bg-zinc-900 p-7 shadow-xl'>{file.completedJobsCount}<p className='text-lg font-bold'>Total Completed Jobs</p></div>
                        </div>
                    </div>
                }
            </div>

                
            </Loader>
        </DashboardLayout>
    );
};


export const getServerSideProps = withAuthorizedPageAccess({
    getServerSideProps: async (context: any) => {

        const uuid = context.query["workflow-uuid"] as string;

        const workflow = await db.workflow.findFirst({
            where: {
                uuid,
                status: obj_status.active
            },
            select: {
                name: true,
                desc: true,
                uuid: true,
            }
        });

        return {
            props: {
                workflow
            }
        }
    }
}, member_role.manager);

export default DashboardPage;