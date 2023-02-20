import React, {useCallback, useMemo, useRef} from 'react';
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
import RatingRenderer from "@/components/renderer/RatingRenderer";

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

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
        };
    }, []);

    const detailCellRendererParams = useMemo(() => {
        console.log("detailCellRendererParams")
        return {
            detailGridOptions: {
                columnDefs: [
                    { header: "Question" , field: 'question.text' },
                    { header: "Answer", field: 'answer' },
                    { createdAt: "Answered At", field: 'createdAt', cellRenderer: DateFromNowRenderer}
                ],
                defaultColDef: {
                    flex: 1,
                },
            },
            getDetailRowData: function (params: any) {
                console.log(params.data)
                params.successCallback(params.data.task_answers);
            },
        };
    }, []);

    const isRowMaster = useMemo(() => {
        return (dataItem: any) => {
            console.log({dataItem})
            return dataItem ? dataItem.task_answers?.length > 0 : false;
        };
    }, []);

    const onFirstDataRendered = useCallback((params: any) => {
        // arbitrarily expand a row for presentational purposes
        setTimeout(function () {
            // @ts-ignore
            fileGridRef.current.api.getDisplayedRowAtIndex(0).setExpanded(true);
        }, 0);
    }, []);



    if(error) {
        return <div>Error fetching</div>
    }


    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"answers"} workflowUUID={workflowUUID}/> }>
            <Head>
                <title>Answered Files</title>
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
                            isRowMaster={isRowMaster}
                            detailCellRendererParams={detailCellRendererParams}
                            // rowGroupPanelShow={"onlyWhenGrouping"}
                            onFirstDataRendered={onFirstDataRendered}
                            pivotMode={false}
                            defaultColDef={defaultColDef}
                            paginationPageSize={15}
                            columnDefs={[
                                {
                                    headerName: "File",
                                    field: "workflow_file.file_name",
                                    cellRenderer: 'agGroupCellRenderer'
                                },
                                {
                                    headerName: "District",
                                    field: "workflow_file.district",
                                },
                                {
                                    headerName: "Assigned To",
                                    field: "assignee.name",
                                },
                                {
                                    headerName: "Ph. No",
                                    field: "assignee.phone",
                                },
                                {
                                    headerName: "Rating",
                                    field: "rating",
                                    cellRenderer: RatingRenderer
                                },
                                {
                                    headerName: "Comment",
                                    field: "review_comment",
                                }

                            ]}
                        />
                </div>
                </Loader>
            </div>
        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({}, member_role.associate);

export default UnassignedFilesPage;