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
import RatingRenderer from "@/components/renderer/RatingRenderer";
import useSWRImmutable from 'swr/immutable';
import axios from 'axios';
import clsx from "clsx";
import UrlRenderer from "@/components/renderer/UrlRenderer";
import { toast } from "react-toastify";
import { ISelectCellEditorParams } from 'ag-grid-community';
import SelectRenderer from '@/components/renderer/SelectRenderer';

interface UnassignedFilesPageProps {
    files: any[]
}


const UnassignedFilesPage = (_props: UnassignedFilesPageProps) => {

    const fileGridRef = useRef<AgGridReactType>(null);
    const router = useRouter();
    const [taskRatings, setTaskRatings] = useState(new Map<string, number>())

    const updatedLocalRating = (uuid: string, rating: number) => {
        setTaskRatings((prev: Map<string, number>) => prev.set(uuid, rating));
    }

    const workflowUUID = router.query["workflow-uuid"] as string;
    const { data, error, isLoading, mutate } = useSWR<Prisma.workflow_fileSelect[]>(`/api/v1/${workflowUUID}/answer`, { refreshInterval: 24 * 60 * 60 * 1000 });
    const files = data || [];

    const [updatingReview, setUpdatingReviews] = useState(false);

    const { data: questionData, error: questionFetchError, isLoading: questionFetchLoading } = useSWRImmutable(`/api/v1/${workflowUUID}/question`)
    console.log(data)

    const detailCellRendererParams = useMemo(() => {
        console.log("detailCellRendererParams")

        async function onCellValueChanged(event: any, questionUUID: string) {
            const newValue = event.newValue;
            const taskAssignmentUUID = event.data.uuid;

            try {
                const response = await axios.post(`/api/v1/editresponse?taskAssignmentUUID=${taskAssignmentUUID}&questionUUID=${questionUUID}&value=${newValue}`)
                toast(`${response.data} from ${event.oldValue} to ${event.newValue} `, { type: "success" });
            }
            catch (error: any) {
                toast(`${error.message}`, { type: "error" });
                console.log(error)
            }
        }

        const staticColumnDefs = [
            { headerName: "Assignee Name", field: 'assignee.name', tooltipField: 'assignee.name', tooltipEnable: true },
            { headerName: "Assignee Ph. No", field: 'assignee.phone' },
            { headerName: "Assinged At", field: 'createdAt', cellRenderer: (params: any) => {
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
            }},
            { headerName: "Answered At", field: 'updatedAt', cellRenderer: (params: any) => {
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
            }},
        ]

        const dynamicColumnDef = questionData?.map((question: any) => {
            return { headerName: question.name, field: `task_answers.${question.uuid}`, cellRenderer: SelectRenderer, cellEditor: 'agSelectCellEditor', cellEditorParams: { values: question.options } as ISelectCellEditorParams, editable: question.name.includes('Comments') ? false : true, onCellValueChanged: (event: any) => onCellValueChanged(event, question.uuid) }
        }) || [];

        const colDef = [
            ...staticColumnDefs,
            ...dynamicColumnDef,
            ...[{
                headerName: "Rating", field: "rating", minWidth: 150, cellRenderer: (props: any) => (<RatingRenderer onRatingChange={(rating, data) => {
                    updatedLocalRating(data.uuid, rating)
                }}
                    {...props} oldRating={(data: { uuid: string; }) => taskRatings.get(data.uuid)} />)
            }]
        ];

        return {
            detailGridOptions: {
                columnDefs: colDef,
                defaultColDef: {
                    flex: 1,
                    overflow: 'auto'


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

    const handleRate = () => {
        console.log(taskRatings)
        setUpdatingReviews(true);
        axios.post(`/api/v1/${workflowUUID}/review_answers`, Array.from(taskRatings))
            .then(_response => {
                setUpdatingReviews(false);
                mutate().then(() => {
                    console.log("files updated");
                    toast("Review Posted", { type: "success" });

                });

            })
            .catch(error => {
                console.error(error);
                setUpdatingReviews(false);
                toast("Error posting review", { type: "error" });
            })
        setTaskRatings(new Map<string, number>())
    }

    if (error || questionFetchError) {
        return <div>Error fetching</div>
    }

    const ActionItem = () => <div>
        <button className={clsx("btn", { "btn-secondary": true })} onClick={handleRate}>
            {updatingReview ? "Saving. . ." : "Save Changes"}
        </button>
    </div>

    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"answers"} workflowUUID={workflowUUID} />}>
            <Head>
                <title>Answered Files</title>
            </Head>

            <div>
                <div className={"mt-2 flex justify-between"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 id={""} className={"text-xl font-semibold"}>
                            Unreviewed Answers
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Answered tasks are tasks that have been answered by a member.
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
                            masterDetail={true}
                            isRowMaster={isRowMaster}
                            detailCellRendererParams={detailCellRendererParams}
                            detailRowAutoHeight={true}
                            detailRowHeight={250}
                            rowGroupPanelShow={"onlyWhenGrouping"}
                            sideBar={{ toolPanels: ["columns", "filters"], hiddenByDefault: false }}
                            // rowGroupPanelShow={"onlyWhenGrouping"}
                            onFirstDataRendered={onFirstDataRendered}
                            groupDefaultExpanded={-1}
                            pivotMode={false}
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
                            paginationPageSize={15}
                            columnDefs={[
                                {
                                    headerName: "File",
                                    field: "file_name",
                                    cellRenderer: 'agGroupCellRenderer',
                                    tooltipField: 'file_name',
                                    headerTooltip: "Good Work",

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

export default UnassignedFilesPage;
