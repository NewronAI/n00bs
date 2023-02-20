import React, {useMemo, useRef} from 'react';
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {useRouter} from "next/router";
import {AgGridReact} from "ag-grid-react";
import useSWR from "swr";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import moment from "moment";
import FileTypeRenderer from '@/components/renderer/FileTypeRenderer';
import DateFromNowRenderer from '@/components/renderer/DateFromNowRenderer';
import {AgGridReact as AgGridReactType} from 'ag-grid-react/lib/agGridReact'
import 'ag-grid-enterprise';

import UrlRenderer from '@/components/renderer/UrlRenderer'
import {member_role, Prisma} from "@prisma/client";
import Modal from "@/components/Modal";
import axios from "axios";
import Loader from "@/components/Loader";
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import FileAssignmentCountRenderer from "@/components/renderer/FileAssignmentCountRenderer";

interface UnassignedFilesPageProps {
    files : any[]
}

function getSelectedRegionsCount(selectedRows : {district : string}[]) {
    const selectedRegionsMap = new Map<string,number>();

    selectedRows.forEach((row) => {
        if(selectedRegionsMap.has(row.district)){
            const prevCount = selectedRegionsMap.get(row.district) || 0;
            selectedRegionsMap.set(row.district, prevCount + 1);
        } else {
            selectedRegionsMap.set(row.district, 1);
        }
    });

    return selectedRegionsMap.size;
}


const UnassignedFilesPage = (props : UnassignedFilesPageProps) => {

    const fileGridRef = useRef<AgGridReactType>(null);
    const router = useRouter();

    const workflowUUID = router.query["workflow-uuid"] as string;
    const {data, error, isLoading, mutate} = useSWR<Prisma.workflow_fileSelect[]>(`/api/v1/${workflowUUID}/answer`);
    const files = data || [];

    const detailCellRendererParams = useMemo(() => {
        return {
            detailGridOptions: {
                columnDefs: [
                    { field: 'callId' },
                    { field: 'direction' },
                    { field: 'number', minWidth: 150 },
                    { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                    { field: 'switchCode', minWidth: 150 },
                ],
                defaultColDef: {
                    flex: 1,
                },
            },
            getDetailRowData: function (params: any) {
                params.successCallback(params.data.callRecords);
            },
        };
    }, []);



    if(error) {
        return <div>Error fetching</div>
    }


    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"unassigned files"} workflowUUID={workflowUUID}/> }>
            <Head>
                <title>Unassigned Files</title>
            </Head>

            <div>
                <div className={"mt-2 flex justify-between"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 id={""} className={"text-xl font-semibold"}>
                            Answered Tasks
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Answered tasks are tasks that have been answered by a member.
                        </p>
                    </div>
                    <div className={"flex items-center mr-5 btn-group"}>

                    </div>
                </div>
                <Loader isLoading={isLoading}>
                    <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
                        <AgGridReact
                            rowData={files}
                            suppressMenuHide={true}
                            pagination={true}
                            ref={fileGridRef}
                            masterDetail={true}
                            isRowMaster={(data) => data.children.length > 0}
                            detailCellRenderer={detailCellRendererParams}
                            rowGroupPanelShow={"onlyWhenGrouping"}
                            pivotMode={false}
                            pivotPanelShow={"always"}
                            groupSelectsChildren={true}
                            rowSelection='multiple'
                            paginationPageSize={15}
                            // columnDefs={}
                        />
                </div>
                </Loader>
            </div>
        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({}, member_role.associate);

export default UnassignedFilesPage;