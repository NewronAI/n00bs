import React, { useRef } from 'react'
import DashboardLayout from "@/components/layouts/DashboardLayout";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import { AgGridReact } from "ag-grid-react";
import { AgGridReact as AgGridReactType } from 'ag-grid-react/lib/agGridReact'
import useSWR from "swr";
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import { Prisma } from "@prisma/client";
import Loader from "@/components/Loader";
import { useRouter } from 'next/router';
import DateFromNowRenderer from '@/components/renderer/DateFromNowRenderer';
import 'ag-grid-enterprise';
import UrlRenderer from '@/components/renderer/UrlRenderer'
import FilenameRenderer from "@/components/renderer/FilenameRenderer";
import fileDurationFormatter from "@/helpers/react/fileDurationFormatter";

interface assignedFilesPageProps {
    files: any[];
}

const AssignedFilesPage = (_props: assignedFilesPageProps) => {

    const fileGridRef = useRef<AgGridReactType>(null);
    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;

    const { data, error, isLoading } = useSWR<Prisma.workflow_fileSelect[]>(`/api/v1/${workflowUUID}/file/assigned`, (url) => fetch(url).then(res => res.json()));
    const files = data || [];
    console.log(files)

    if (error) {
        return <div>Error fetching data: {error.message}</div>
    }

    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"assigned files"} workflowUUID={workflowUUID} />} >
            <Head>
                <title>Assigned Files</title>
            </Head>
            <div>
                <div className={"mt-2 flex justify-between"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 className={"text-xl font-semibold"}>
                            Assigned Files
                        </h1>
                        <p className={"font-thin text-sm"}>
                            All the files uploaded to the workflow, which are assigned to any user.
                        </p>
                    </div>
                </div>
                <Loader isLoading={isLoading}>
                    <div className={"w-full h-[760px] p-4 ag-theme-alpine"}>
                        <AgGridReact
                            rowData={files}
                            suppressMenuHide={true}
                            pagination={true}
                            ref={fileGridRef}
                            rowSelection='multiple'
                            paginationPageSize={15}
                            groupDefaultExpanded={-1}
                            rowGroupPanelShow={"onlyWhenGrouping"}
                            animateRows={true}
                            sideBar={{ toolPanels: ["columns", "filters"], hiddenByDefault: false }}
                            defaultColDef={{
                                flex: 1,
                                minWidth: 100,
                                // allow every column to be aggregated
                                enableValue: true,
                                // allow every column to be grouped
                                enableRowGroup: true,
                                // allow every column to be pivoted
                                enablePivot: true,
                                sortable: true,
                                filter: true,
                                resizable: true,
                            }}
                            columnDefs={[
                                { headerName: "File State", field: "state", rowGroup: true, hide: true, sortable: true, filter: true, width: 150 },
                                { headerName: "File District", field: "district", rowGroup: true, hide: true, sortable: true, filter: true, width: 150 },
                                { headerName: "Duration", field: "file_duration", sortable: true, filter: true, width: 135, valueFormatter: fileDurationFormatter, aggFunc: 'sum' },
                                { headerName: "File Name", field: "file_name", rowGroup: true, sortable: true, filter: true, width: 450, cellRenderer: FilenameRenderer, tooltipField: "file_name" },
                                { headerName: "Vendor", field: "vendor", sortable: true, filter: true, width: 150 },
                                { headerName: "Member Name", field: "memeber_name", sortable: true, filter: true, width: 150 },
                                { headerName: "Member State", field: "member_district", sortable: true, filter: true, width: 150 },
                                { headerName: "Member State", field: "member_state", sortable: true, filter: true, width: 150 },
                                { headerName: "Phone No.", field: "member_phone", sortable: true, filter: true, width: 150 },
                                { headerName: "File Path", field: "file", sortable: true, filter: true, width: 500, cellRenderer: UrlRenderer },
                                { headerName: "Received at", field: "receivedAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 150 },
                                { headerName: "Created at", field: "createdAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 150 },
                            ]} />
                    </div>
                </Loader>
            </div>
        </DashboardLayout>
    )
}

export default AssignedFilesPage
