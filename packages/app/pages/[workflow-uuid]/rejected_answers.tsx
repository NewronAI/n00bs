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
import RatingViewer from '@/components/renderer/RatingViewer';
import Modal from '@/components/Modal';

interface UnassignedFilesPageProps {
    files: any[]
}


const RejectedFilesPage = (_props: UnassignedFilesPageProps) => {

    const fileGridRef = useRef<AgGridReactType>(null);
    const router = useRouter();

    const memberGridRef = useRef<AgGridReactType>(null);
    const [delData, setDelData] = React.useState<any>({})
    const [assignModalError, setAssignModalError] = React.useState<string | null>(null);
    const [assignDialogOpenEdit, setAssignDialogOpenEdit] = React.useState<boolean>(false);

    const workflowUUID = router.query["workflow-uuid"] as string;
    const { data, error, isLoading, mutate } = useSWR<Prisma.workflow_fileSelect[]>(`/api/v1/${workflowUUID}/answer/answer_rejected`);
    const files = data || [];
    console.log({files})


    const { data: questionData, error: questionFetchError, isLoading: questionFetchLoading } = useSWRImmutable(`/api/v1/${workflowUUID}/question`)
    console.log(questionData)

    const { data: members, error: membersError, isLoading: membersLoading } = useSWR<Prisma.memberSelect[]>(`/api/v1/member`, (url) => fetch(url).then(res => res.json()));

    const detailCellRendererParams = useMemo(() => {
        console.log("detailCellRendererParams")

        const staticColumnDefs = [
            {
                headerName: 'Action', field: 'button', cellRenderer: ({ data }: { data: any }) => {
                    return (
                        <div className='btn-group'>
                            <button className='btn btn-xs btn-secondary' onClick={() => handleReassignModal(data)} >Reassign</button>
                        </div>
                    )
                }
            },
            { headerName: "Assignee Name", field: 'assignee.name', tooltipField: 'assignee.name', tooltipEnable: true },
            { headerName: "Assignee Ph. No", field: 'assignee.phone' },
            { headerName: "Assinged At", field: 'createdAt', cellRenderer:  (params: any) => {
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
             } },
             { headerName: "Answered At", field: 'answerAt', cellRenderer:  (params: any) => {
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
             } },
             { headerName: "Reviewed At", field: 'updatedAt', cellRenderer:  (params: any) => {
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
             } },
        ]

        const dynamicColumnDef = questionData?.map((question: any) => {
            return { headerName: question.name, field: `task_answers.${question.uuid}` }
        }) || [];

        const colDef = [
            ...staticColumnDefs,
            ...dynamicColumnDef,
            ...[{
                headerName: "Rating", field: "review_rating",minWidth: 120, cellRenderer: RatingViewer
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


    const handleReassign = async () => {

        if (!memberGridRef.current) {
            setAssignModalError("Something went wrong. Page not loaded properly");
            return null;
        }

        const selectedMembers = memberGridRef.current?.api.getSelectedRows();

        if (selectedMembers.length === 0) {
            setAssignModalError("Please select some member | task");
            return null;
        }

        setAssignModalError(null);

        const selectedMemberUUID: string = selectedMembers[0].uuid;

        console.log("API is getting called")

        try {
            const response = await axios.post(`/api/v1/${workflowUUID}/task/force-reassign`, null, {
                params: {
                    "task-assignment-uuid": delData.uuid,
                    "assignee-uuid": selectedMemberUUID,
                }
            });
            console.log(response)
            await mutate();
            setAssignDialogOpenEdit(false);
        } catch (e) {
            console.log(e);
        }
    }


    const handleReassignModal = (data: any) => {
        setAssignDialogOpenEdit(true)
        setDelData(data)
    }
    const handleDialogClose = () => {
        setAssignDialogOpenEdit(false)
    }


    if (error) {
        return <div>Error fetching</div>
    }


    const ActionItem = () => <div>

    </div>

    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"rejected_answers"} workflowUUID={workflowUUID} />}>
            <Head>
                <title>Disapproved Answer</title>
            </Head>

            <div>
                <div className={"mt-2 flex justify-between"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 id={""} className={"text-xl font-semibold"}>
                            Disapproved Answer
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Disapproved tasks are tasks that have been Disapproved by a member.
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

                {/* --- */}
                <Modal open={assignDialogOpenEdit}
                    onClose={handleDialogClose}
                >
                    <div className="flex flex-col">
                        <div className="flex flex-col mt-4">
                            <label className="block text-sm font-medium ">Assign to</label>
                            <p className={"text-sm font-thin"}>
                                Click on the member to select the account on which you want to assign the files.
                            </p>
                        </div>
                        <Loader isLoading={membersLoading}>
                            <div className="mt-2 flex flex-col h-60 ag-theme-balham-dark">
                                <AgGridReact
                                    rowData={members}
                                    suppressMenuHide={true}
                                    pagination={true}
                                    ref={memberGridRef}
                                    rowSelection='single'
                                    paginationPageSize={6}
                                    columnDefs={[

                                        {
                                            headerName: "Name",
                                            field: "name",
                                            sortable: true,
                                            filter: true,
                                        },
                                        {
                                            headerName: "District",
                                            field: "district",
                                            sortable: true,
                                            filter: true,
                                        },
                                        {
                                            headerName: "State",
                                            field: "state",
                                            sortable: true,
                                            filter: true,
                                        },
                                        {
                                            headerName: "Phone",
                                            field: "phone",
                                            sortable: true,
                                            filter: true,
                                        },
                                        {
                                            headerName: "Role",
                                            field: "role",
                                            sortable: true,
                                            filter: true,
                                        },
                                        {
                                            headerName: "Email",
                                            field: "email",
                                            sortable: true,
                                            filter: true,
                                        },

                                    ]}
                                />
                            </div>
                        </Loader>
                        <div className={"flex justify-between mt-4 btn-group"}>
                            <div className={"text-sm text-error"}>
                                {assignModalError}
                            </div>
                            <div>
                                <button className={"btn btn-sm btn-ghost"} onClick={handleDialogClose} >
                                    Cancel
                                </button>
                                <button className={"btn btn-sm px-8 btn-primary"} onClick={handleReassign} >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>



                {/* --- */}



            </div>
        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({}, member_role.associate);

export default RejectedFilesPage;
