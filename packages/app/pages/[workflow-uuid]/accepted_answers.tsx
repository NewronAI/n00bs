import React, { useCallback, useMemo, useRef, useState } from 'react';
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { AgGridReact } from "ag-grid-react";
import useSWR from "swr";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import DateFromNowRenderer from '@/components/renderer/DateFromNowRenderer';
import { AgGridReact as AgGridReactType } from 'ag-grid-react/lib/agGridReact'
import 'ag-grid-enterprise';
import { member_role, Prisma } from "@prisma/client";
import Loader from "@/components/Loader";
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import useSWRImmutable from 'swr/immutable';
import UrlRenderer from "@/components/renderer/UrlRenderer";
import RatingViewer from '@/components/renderer/RatingViewer';
import moment from 'moment';


interface UnassignedFilesPageProps {
    files: any[]
}


const AcceptedFilesPage = (_props: UnassignedFilesPageProps) => {

    const fileGridRef = useRef<AgGridReactType>(null);
    const router = useRouter();
    const [taskRatings, _setTaskRatings] = useState(new Map<string, number>())


    const workflowUUID = router.query["workflow-uuid"] as string;
    const { data, error, isLoading } = useSWR<Prisma.workflow_fileSelect[]>(`/api/v1/${workflowUUID}/answer/answer_accepted`);
    const files = data || [];
    console.log("files", files)


    const { data: questionData, error: questionFetchError, isLoading: questionFetchLoading } = useSWRImmutable(`/api/v1/${workflowUUID}/question`)
    console.log('questionData', questionData)

    const detailCellRendererParams = useMemo(() => {
        console.log("detailCellRendererParams")

        const staticColumnDefs = [
            { headerName: "Assignee Name", field: 'assignee.name', tooltipField: 'assignee.name', tooltipEnable: true },
            { headerName: "Assignee Ph. No", field: 'assignee.phone' },
            {
                headerName: "Assinged At", field: 'createdAt',
                // cellRenderer: DateFromNowRenderer
                cellRenderer: (params: any) => {
                    const receivedAt: string = params.value;
                    let formattedDate: string = '';

                    if (receivedAt) {
                        const date: Date = new Date(receivedAt);
                        const day: string = date.getDate().toString().padStart(2, '0');
                        const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
                        const year: number = date.getFullYear();
                        formattedDate = `${day}/${month}/${year}`;
                    }

                    return formattedDate;
                },
                width: 120
            },
            {
                headerName: "Answered At", field: 'answerAt',
                // cellRenderer: DateFromNowRenderer
                cellRenderer: (params: any) => {
                    const receivedAt: string = params.value;
                    let formattedDate: string = '';

                    if (receivedAt) {
                        const date: Date = new Date(receivedAt);
                        const day: string = date.getDate().toString().padStart(2, '0');
                        const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
                        const year: number = date.getFullYear();
                        formattedDate = `${day}/${month}/${year}`;
                    }

                    return formattedDate;
                },
                width: 120
            },
            {
                headerName: "Reviewd At", field: 'updatedAt',
                // cellRenderer: DateFromNowRenderer
                cellRenderer: (params: any) => {
                    const receivedAt: string = params.value;
                    let formattedDate: string = '';

                    if (receivedAt) {
                        const date: Date = new Date(receivedAt);
                        const day: string = date.getDate().toString().padStart(2, '0');
                        const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
                        const year: number = date.getFullYear();
                        formattedDate = `${day}/${month}/${year}`;
                    }

                    return formattedDate;
                },
                width: 120
            },
        ]

        const dynamicColumnDef = questionData?.map((question: any) => {
            return { headerName: question.name, field: `task_answers.${question.uuid}` }
        }) || [];


        const colDef = [
            ...staticColumnDefs,
            ...dynamicColumnDef,
            ...[{
                headerName: "Rating", field: "review_rating", minWidth: 100, cellRenderer: RatingViewer
            }]
        ];




        return {
            detailGridOptions: {
                columnDefs: colDef,
                defaultColDef: {
                    flex: 1,
                },
            },
            getDetailRowData: function (params: any) {
                console.log(params.data)
                params.successCallback(params.data.task_assignments);
            },
        };
    }, [questionData]);

    const isRowMaster = useMemo(() => {
        return (dataItem: any) => {
            console.log({ dataItem })
            return dataItem ? dataItem.task_assignments?.length > 0 : false;
        };
    }, []);

    const onFirstDataRendered = useCallback((_params: any) => {
        // arbitrarily expand a row for presentational purposes
        setTimeout(function () {
            // @ts-ignore
            fileGridRef.current.api.getDisplayedRowAtIndex(0).setExpanded(true);
        }, 0);
    }, []);


    if (error || questionFetchError) {
        return <div>Error fetching</div>
    }

    console.log(taskRatings.size)

    const ActionItem = () => <div>

    </div>

    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"accepted_answers"} workflowUUID={workflowUUID} />}>
            <Head>
                <title>Approved Answer</title>
            </Head>

            <div>
                <div className={"mt-2 flex justify-between"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 id={""} className={"text-xl font-semibold"}>
                            Approved  Answer
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Approved tasks are tasks that have been Approved by a member.
                        </p>
                    </div>
                    <div className={"flex items-center mr-5 btn-group"}>
                        <ActionItem />
                    </div>
                </div>
                <Loader isLoading={isLoading || questionFetchLoading}>
                    <div className={"w-full h-[760px] p-4 ag-theme-alpine"}>
                        <AgGridReact
                            rowData={files}
                            suppressMenuHide={true}
                            pagination={true}
                            ref={fileGridRef}
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
                            rowGroupPanelShow={"onlyWhenGrouping"}
                            sideBar={{ toolPanels: ["columns", "filters"], hiddenByDefault: false }}
                            masterDetail={true}
                            isRowMaster={isRowMaster}
                            detailCellRendererParams={detailCellRendererParams}
                            detailRowAutoHeight={true}
                            detailRowHeight={250}
                            // rowGroupPanelShow={"onlyWhenGrouping"}
                            onFirstDataRendered={onFirstDataRendered}
                            groupDefaultExpanded={-1}
                            pivotMode={false}
                            paginationPageSize={15}
                            columnDefs={[
                                {
                                    headerName: "File",
                                    field: "file_name",
                                    cellRenderer: 'agGroupCellRenderer',
                                    tooltipField: 'file_name',
                                    headerTooltip: "",

                                },
                                { headerName: "Vendor", field: "vendor", sortable: true, filter: true, width: 150 },
                                {
                                    headerName: "District",
                                    field: "district",
                                },
                                {
                                    headerName: "State",
                                    field: "state",
                                },
                                {
                                    headerName: "File",
                                    field: "file",
                                    cellRenderer: UrlRenderer
                                },
                                // {
                                //     headerName: " Assigned At",
                                //     field: "createdAt",
                                //     // cellRenderer: DateFromNowRenderer
                                //     cellRenderer: (data: any) => {
                                //         return moment(data.createdAt).format('MM/DD/YYYY')
                                //     },
                                //     width: 120
                                // },
                                // {
                                //     headerName: "Reviewed at", field: "updatedAt", sortable: true, filter: true,
                                //     cellRenderer: (data: any) => {
                                //         return moment(data.updateAt).format('MM/DD/YYYY')
                                //     }
                                //     , width: 130
                                // },
                                {
                                    headerName: "File Received at",
                                    field: "receivedAt",
                                    sortable: true,
                                    filter: true,
                                    cellRenderer: (params: any) => {
                                        const receivedAt: string = params.value;
                                        let formattedDate: string = '';

                                        if (receivedAt) {
                                            const date: Date = new Date(receivedAt);
                                            const day: string = date.getDate().toString().padStart(2, '0');
                                            const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
                                            const year: number = date.getFullYear();
                                            formattedDate = `${day}/${month}/${year}`;
                                        }

                                        return formattedDate;
                                    },
                                    width: 120
                                },

                            ]}
                        />
                    </div>
                    <div className={"flex justify-end p-3"}>
                        <ActionItem />
                    </div>
                </Loader>

            </div>
        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({}, member_role.associate);

export default AcceptedFilesPage;
