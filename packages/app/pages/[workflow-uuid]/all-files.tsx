import React from 'react';
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import HandleCopy from "@/components/HandleCopy";
import workflow from "../api/v1/workflow";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {useRouter} from "next/router";
import {AgGridReact} from "ag-grid-react";
import useSWR from "swr";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const AllFilesPage = () => {

    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;

    const [currentPage, setCurrentPage] = React.useState(0);

    const {data, error, isLoading} = useSWR(`/api/v1/${workflowUUID}/file?page=${currentPage}`, (url) => fetch(url).then(res => res.json()));

    const files = data?.data || [];
    console.log(files);

    if(error) {
        return <div>Error fetching</div>
    }

    if(isLoading) {
        return <div>Loading...</div>
    }


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
                <div className={"w-full h-[500px] p-4 ag-theme-alpine-dark"}>
                    <AgGridReact
                        rowData={files}
                        suppressMenuHide={true}
                        columnDefs={[
    {headerName: "File Name", field: "file_name", sortable: true, filter: true},
    {headerName: "File Type", field: "file_type", sortable: true, filter: true},
    {headerName: "File Path", field: "file", sortable: true, filter: true},
    {headerName: "File Status", field: "status", sortable: true, filter: true},
    {headerName: "File UUID", field: "uuid", sortable: true, filter: true},
]}
                        />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AllFilesPage;