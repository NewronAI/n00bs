import React from 'react';
import Head from "next/head";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import WorkflowNav from "@/components/layouts/WorkflowNav";
import {member_role, obj_status, prisma} from "@prisma/client";
import {db} from "@/helpers/node/db";
import WorkflowItem from "@/interfaces/WorkflowItem";
import IngestFilesDoc from "@/components/IngestFilesDoc";
import HandleCopy from "@/components/HandleCopy";
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";

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

                        <HandleCopy text={workflowUUID || ""} />
                    </div>
                </div>

                <div>
                    <IngestFilesDoc workflowUUID={workflowUUID} />
                </div>
            </div>
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