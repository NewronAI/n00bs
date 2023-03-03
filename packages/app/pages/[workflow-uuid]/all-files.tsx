import React from 'react';
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {useRouter} from "next/router";
import {AgGridReact} from "ag-grid-react";
import useSWR from "swr";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import UrlRenderer from '@/components/renderer/UrlRenderer'
import FileTypeRenderer from '@/components/renderer/FileTypeRenderer';
import DateFromNowRenderer from '../../src/components/renderer/DateFromNowRenderer';
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import {member_role} from "@prisma/client";
import 'ag-grid-enterprise';
import Loader from "@/components/Loader";
import LongTextRenderer from "@/components/renderer/FilenameRenderer";
import FilenameRenderer from "@/components/renderer/FilenameRenderer";
import fileDurationFormatter from "@/helpers/react/fileDurationFormatter";

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
                <Loader isLoading={isLoading} >
                    <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
                        <AgGridReact
                            rowData={files}
                            pagination={true}
                            groupDefaultExpanded={1}
                            paginationPageSize={15}
                            suppressMenuHide={true}
                            columnDefs={[
                                {headerName: "State", field: "state", sortable: true, filter: true,rowGroup:true, hide: true, width: 130,},
                                {headerName: "District", field: "district", sortable: true, rowGroup: true, hide: true, filter: true, width: 150,},
                                {headerName: "Duration", field: "file_duration", sortable: true, filter: true, width: 135, valueFormatter: fileDurationFormatter, aggFunc: 'sum'},
                                {headerName: "Type", field: "file_type", sortable: true, cellRenderer: FileTypeRenderer, width: 100,},
                                {headerName: "Vendor", field: "vendor", sortable: true, filter: true, width: 150},
                                {headerName: "File Name", field: "file_name", sortable: true, filter: true, width: 300, tooltipField: "file_name", cellRenderer: FilenameRenderer},
                                {headerName: "File Path", field: "file", sortable: true, filter: true, cellRenderer: UrlRenderer },
                                {headerName: "File UUID", field: "uuid", sortable: true, filter: true},
                                {headerName: "Created", field: "createdAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 120 },
                                {headerName: "Received", field: "receivedAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 120 },
                            ]}
                        />
                    </div>
                </Loader>
            </div>
        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({}, member_role.associate);

export default AllFilesPage;