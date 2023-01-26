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
import UrlRenderer from '@/components/renderer/UrlRenderer'
import { ClipLoader } from 'react-spinners';
import FileTypeRenderer from '@/components/renderer/FileTypeRenderer';
import DateFromNowRenderer from '../../src/components/renderer/DateFromNowRenderer';

const AllFilesPage = () => {

    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;

    const [currentPage, setCurrentPage] = React.useState(0);

    const {data, error, isLoading} = useSWR(`/api/v1/${workflowUUID}/file?page=${currentPage}`, (url) => fetch(url).then(res => res.json()));

    const files = data || [];
    console.log(data);

    if(error) {
        return <div>Error fetching</div>
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">
            <ClipLoader size={50} color={'#123abc'}  />
        </div>;
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
                <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
                    <AgGridReact
                        rowData={files}
                        pagination={true}
                        paginationPageSize={15}
                        suppressMenuHide={true}
                        columnDefs={[
    {headerName: "Type", field: "file_type", sortable: true, cellRenderer: FileTypeRenderer, width: 70,},
    {headerName: "State", field: "state", sortable: true, filter: true, width: 130,},
    {headerName: "District", field: "district", sortable: true, filter: true, width: 130,},
    {headerName: "File Name", field: "file_name", sortable: true, filter: true, width: 300},
    {headerName: "File Path", field: "file", sortable: true, filter: true, cellRenderer: UrlRenderer },
    {headerName: "File Duration", field: "file_duration", sortable: true, filter: true, width: 135},
    {headerName: "File UUID", field: "uuid", sortable: true, filter: true},
    {headerName: "Created", field: "createdAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 120 },
    {headerName: "Vendor", field: "vendor", sortable: true, filter: true, width: 110},
]}
                        />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AllFilesPage;