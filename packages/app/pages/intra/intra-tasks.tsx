import DashboardLayout from "@/components/layouts/DashboardLayout";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import {AgGridReact} from "ag-grid-react";
import DateFromNowRenderer from "@/components/renderer/DateFromNowRenderer";
import Loader from "@/components/Loader";
import React from "react";
import useSWR from "swr";
import Link from "next/link";


const LinkRenderer = ({value,data} : {value: string, data: any}) => (<Link href={`/intra/${data.uuid}/files`}>
    {value}
</Link>);

const CreateNewIntraPair = () => {

    const {data: intraJobData, error: intraJobError, isLoading: intraJobIsLoading} = useSWR<any>(`/api/v1/intra/jobs`);

    if (intraJobError) {
        return <div>Failed to load</div>
    }

    return (
        <DashboardLayout currentPage={"intra check"} secondaryNav={<></>}>

            <div>
                <div className={"pl-4"}>
                    <h1 className={"text-xl font-semibold"}>
                        Listing all Intra Pair Tasks
                    </h1>
                    <p>
                        Here you can see all the tasks that are currently in the system.
                    </p>
                </div>


                <div>
                    <Loader isLoading={intraJobIsLoading} error={(!intraJobData) && !intraJobIsLoading ? "Failed to load data" : undefined}>
                        <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
                            <AgGridReact
                                rowData={intraJobData}
                                suppressMenuHide={true}
                                pagination={true}
                                rowSelection='multiple'
                                paginationPageSize={15}
                                groupDefaultExpanded={1}
                                animateRows={true}
                                columnDefs={[
                                    {headerName: "Name", field: "name", sortable: true, filter: true, resizable: true, cellRenderer: LinkRenderer},
                                    {headerName: "Status", field: "status", sortable: true, filter: true, resizable: true},
                                    {headerName: "Files", field: "files_count", sortable: true, filter: true, resizable: true, },
                                    {headerName: "Created By", field: "created_by_name", sortable: true, filter: true, resizable: true},
                                    {headerName: "Created By", field: "created_by_email", sortable: true, filter: true, resizable: true},
                                    {headerName: "Created At", field: "createdAt", sortable: true, filter: true, resizable: true, cellRenderer: DateFromNowRenderer},
                                    {headerName: "Assigned To", field: "assignedTo", sortable: true, filter: true, resizable: true},
                                    {headerName: "Calculated threshold", field: "threshold", sortable: true, filter: true, resizable: true},

                                ]} />
                        </div>
                    </Loader>
                </div>


            </div>
        </DashboardLayout>
    )
}

export default CreateNewIntraPair;