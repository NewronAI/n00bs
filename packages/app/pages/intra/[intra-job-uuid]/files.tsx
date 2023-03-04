import DashboardLayout from "@/components/layouts/DashboardLayout";
import FilesUploadSelector from "@/components/CSVUploadSelector";
import {useRouter} from "next/router";
import {data} from "autoprefixer";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import {AgGridReact} from "ag-grid-react";
import FilenameRenderer from "@/components/renderer/FilenameRenderer";
import UrlRenderer from "@/components/renderer/UrlRenderer";
import DateFromNowRenderer from "@/components/renderer/DateFromNowRenderer";
import Loader from "@/components/Loader";
import React, {useRef} from "react";
import useSWR from "swr";


const CreateNewIntraPair = () => {

    const intraJobUuid = useRouter().query["intra-job-uuid"] as string;

    const {data: intraJobData, error: intraJobError, isLoading: intraJobIsLoading} = useSWR<any>(`/api/v1/intra/${intraJobUuid}/files`);


    return (
        <DashboardLayout currentPage={"intra check"} secondaryNav={<></>}>

            <div>
                <div className={"pl-4"}>
                    <h1 className={"text-xl font-semibold"}>
                        List of files for Intra Pair Task
                    </h1>
                    <p>
                        Here you can see all the files that are currently in the system.
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
                                    {headerName: "File Name", field: "file_name", sortable: true, filter: true, resizable: true},
                                    {headerName: "Url", field: "file", sortable: true, filter: true, resizable: true, cellRenderer: UrlRenderer},
                                    {headerName: "Status", field: "status", sortable: true, filter: true, resizable: true},
                                    {headerName: "Created At", field: "createdAt", sortable: true, filter: true, resizable: true, cellRenderer: DateFromNowRenderer},
                                    {headerName: "Is Reference", field: "is_reference", sortable: true, filter: true, resizable: true},
                                    {headerName: "Is Similar", field: "is_similar", sortable: true, filter: true, resizable: true},
                                    {headerName: "UUID", field: "uuid", sortable: true, filter: true, resizable: true},

                                ]} />
                        </div>
                    </Loader>
                </div>


            </div>
        </DashboardLayout>
    )
}

export default CreateNewIntraPair;