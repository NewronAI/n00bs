import React from 'react';
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import HandleCopy from "@/components/HandleCopy";
import workflow from "../api/v1/workflow";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {useRouter} from "next/router";
import {AgGridReact} from "ag-grid-react";

const AllFilesPage = () => {

    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;


    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"all files"} workflowUUID={workflowUUID}/> }>
            <Head>
                <title>All Files</title>
            </Head>
            <div>
                <div className={"mt-2 flex justify-between"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 className={"text-2xl font-bold"}>
                            All Files
                        </h1>
                        <p className={"font-thin text-sm"}>
                            All the files uploaded to the workflow.
                        </p>
                    </div>
                    <div className={"flex items-center"}>
                    </div>
                </div>
                <div className={"w-full h-[400px]"}>
                    <AgGridReact
                        rowData={[]}
                        />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AllFilesPage;