import React, { useRef } from 'react';
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import HandleCopy from "@/components/HandleCopy";
import workflow from "../api/v1/workflow";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {useRouter} from "next/router";
import { AgGridReact } from "ag-grid-react";
import useSWR from "swr";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import moment from "moment";
import FileTypeRenderer from '@/components/renderer/FileTypeRenderer';
import DateFromNowRenderer from '@/components/renderer/DateFromNowRenderer';
import { AgGridReact as AgGridReactType } from 'ag-grid-react/lib/agGridReact'

import UrlRenderer from '@/components/renderer/UrlRenderer'

import { ClipLoader } from 'react-spinners';

interface UnassignedFilesPageProps {
    files : any[]
}

const UnassignedFilesPage = (props : UnassignedFilesPageProps) => {

    const gridRef = useRef<AgGridReactType>(null)

    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;

    const {data, error, isLoading} = useSWR(`/api/v1/${workflowUUID}/file/unassigned`, (url) => fetch(url).then(res => res.json()));
    console.log(data);
    const files = data || [];
    

    if(error) {
        return <div>Error fetching</div>
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">
            <ClipLoader size={50} color={'#123abc'}  />
        </div>;
    }

    const handleClick = () => {
       
        if(!gridRef.current){
            return null;
        }

        if(gridRef.current.api.getSelectedRows().length === 0) {
            //Todo
            console.log("Please select some task")
            return
        }
        

    }

    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"unassigned files"} workflowUUID={workflowUUID}/> }>
            <Head>
                <title>Unassigned Files</title>
            </Head>
            <div>
                <div className={"mt-2 flex justify-between"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 className={"text-2xl font-bold"}>
                            Unassigned Files
                        </h1>
                        <p className={"font-thin text-sm"}>
                            All the files uploaded to the workflow, which are not assigned to any user.
                        </p>
                    </div>
                    <div className={"flex items-center mr-5"}>
                        <button onClick={handleClick} className='btn btn-sm'>Assign</button>
                    </div>
                </div>
                <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
                    <AgGridReact
                        rowData={files}
                        suppressMenuHide={true}
                        pagination={true}
                        ref={gridRef}
                        rowSelection='multiple'
                        paginationPageSize={15}
                        columnDefs={[
                            {headerName: "Select", checkboxSelection: true, width: 80},
                            {headerName: "Type", field: "file_type", sortable: true, cellRenderer: FileTypeRenderer, width: 70},
                            {headerName: "File Name", field: "file_name", sortable: true, filter: true},
                            {headerName: "File Path", field: "file", sortable: true, filter: true, width: 250, cellRenderer: UrlRenderer},
                            {headerName: "File Status", field: "status", sortable: true, filter: true, width: 120},
                            {headerName: "File UUID", field: "uuid", sortable: true, filter: true, width: 330},
                            {headerName: "File Duration", field: "file_duration", sortable: true, filter: true, valueFormatter: (params) => {
                                return `${moment.duration(params.value,"second").asMinutes().toFixed(2)} mins`;
                            }, width: 150},
                            {headerName: "Created at", field: "createdAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 120},
                            {headerName: "Updated at", field: "updatedAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 130},
                        ]}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UnassignedFilesPage;