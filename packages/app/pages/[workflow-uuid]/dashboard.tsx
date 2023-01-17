import React from 'react';
import Head from "next/head";
import CreateUpdateQuestion from "@/components/CreateUpdateQuestion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import WorkflowNav from "@/components/layouts/WorkflowNav";
import {useRouter} from "next/router";
import {ClipboardIcon} from "@heroicons/react/outline";
import {NextPageContext} from "next";
import {obj_status, prisma} from "@prisma/client";
import {db} from "@/helpers/node/db";
import WorkflowItem from "@/interfaces/WorkflowItem";
import IngestFilesDoc from "@/components/IngestFilesDoc";

interface DashboardProps {
    workflow: WorkflowItem;
}

// This page is server side rendered
const DashboardPage = (props : DashboardProps) => {

    const workflow : WorkflowItem = props.workflow as WorkflowItem;
    const workflowUUID = workflow.uuid;

    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"dashboard"} workflowUUID={workflowUUID}/> }>
            <Head>
                <title>{workflow.name}</title>
            </Head>
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

                        <button onClick={async () => {await navigator.clipboard.writeText(workflowUUID || "")}}>
                            <ClipboardIcon className={"h-4 w-4"} />
                        </button>
                    </div>
                </div>

                <div>
                    <IngestFilesDoc workflowUUID={workflowUUID} />
                </div>
            </div>
        </DashboardLayout>
    );
};


export const getServerSideProps = async (context: NextPageContext) => {
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


export default DashboardPage;