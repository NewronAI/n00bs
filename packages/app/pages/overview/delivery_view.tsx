import React, { useRef } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from "next/head";
import useSWR from "swr";
import { AgGridReact as AgGridReactType } from 'ag-grid-react/lib/agGridReact'
import Loader from '@/components/Loader';
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import DateFromNowRenderer from '@/components/renderer/DateFromNowRenderer';
import 'ag-grid-enterprise';
import UrlRenderer from '@/components/renderer/UrlRenderer'
import FilenameRenderer from "@/components/renderer/FilenameRenderer";
import fileDurationFormatter from "@/helpers/react/fileDurationFormatter";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import { member_role } from '@prisma/client';
import { db } from "@/helpers/node/db";
import axios from 'axios';
import { Grid, GridOptions, ValueGetterParams } from 'ag-grid-community';

const tabs = [
    { name: "Report", href: "/overview/report" },
    { name: "Delivery View", href: "/overview/delivery_view" },
    { name: "Sliced Report", href: "/overview/sliced-report" },
]

const SecNav = () => {

    const [currentPage, setCurrentPage] = useState("Report")

    return (
        <div className="flex flex-grow flex-col overflow-y-auto  border-r border-gray-800 pt-5 pb-4">
            <div className="mt-5 flex flex-grow flex-col">
                <nav className="flex-1 space-y-1 px-2" aria-label="Sidebar">
                    {tabs.map((item) => (
                        <div key={item.name}>
                            <a
                                className={'text-gray-300 hover:bg-gray-50 hover:text-gray-900 group flex w-full items-center rounded-md py-2 pl-7 pr-5 text-sm font-medium'}
                                href={item.href}
                            >
                                {item.name}
                            </a>
                        </div>
                    )
                    )}
                </nav>
            </div>
        </div>
    )
}

const DeliveryPage = (props: any) => {

    const { questionsData } = props;
    const fileGridRef = useRef<AgGridReactType>(null);

    const { data, error, isLoading } = useSWR(`/api/v1/delivery`, (url) => fetch(url).then(res => res.json()));
    console.log(data);

    function wf3qAnswers(params: ValueGetterParams, i: number) {
        return params.data?.wf_3q[i];
    }

    function wf5qAnswers(params: ValueGetterParams, i: number) {
        return params.data?.wf_5q === null ? null : params.data?.wf_5q[i];
    }

    const staticColumnDefs = [
        { headerName: "File Name", field: "file_name", sortable: true, filter: true, resizable: true, width: 450, cellRenderer: FilenameRenderer, tooltipField: "file_name", },
        { headerName: "Vendor", field: "vendor", sortable: true, filter: true, width: 150 },
        { headerName: "File District", field: "district", sortable: true, filter: true, width: 150, resizable: true, },
        { headerName: "File State", field: "state", sortable: true, filter: true, width: 150, resizable: true, },
        { headerName: "Vendor", field: "vendor", sortable: true, filter: true, width: 150, resizable: true, },
        { headerName: "Duration", field: "file_duration", filter: true, width: 135, valueFormatter: fileDurationFormatter, aggFunc: 'sum', resizable: true, },
        { headerName: "File Path", field: "file", sortable: true, filter: true, width: 500, cellRenderer: UrlRenderer, resizable: true },
    ]

    let dynamicColumnDefs: any[] = []

    questionsData?.map((questions: any) => {
        const questionsData = questions.questionsData;
        for (let i = 0; i < questionsData.length; i++) {
            dynamicColumnDefs = [
                ...dynamicColumnDefs,
                {
                    headerName: questionsData[i].name,
                    valueGetter: questions.workflowID === 1 ? (params: any) => wf3qAnswers(params, i) : (params: any) => wf5qAnswers(params, i),
                    sortable: true,
                    filter: true,
                    width: 200
                }
            ]
        }
    })

    const columnDefs = [
        ...staticColumnDefs,
        ...dynamicColumnDefs,
        ...[
            // { headerName: "Created at", field: "createdAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 150 },
            // { headerName: "Received at", field: "receivedAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 150 },
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

        ]
    ]

    return (
        <DashboardLayout currentPage={"report"} secondaryNav={<SecNav />}>
            <Loader isLoading={isLoading}>
                <Head>
                    <title>Report</title>
                </Head>

                <div className={"mt-2"}>
                    <div className={"p-0 mb-4 md:pl-4"}>
                        <h1 className={"text-2xl font-bold"}>
                            Delivery View
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Combined delivery view of all the workflows.
                        </p>
                    </div>
                    <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
                        <AgGridReact
                            rowData={data}
                            ref={fileGridRef}
                            animateRows={true}
                            sideBar={{ toolPanels: ["columns", "filters"], hiddenByDefault: false }}
                            defaultColDef={{
                                flex: 1,
                                minWidth: 150,
                                // allow every column to be pivoted
                                enablePivot: true,
                                enableRowGroup: true,
                                sortable: true,
                                filter: true,
                            }}
                            columnDefs={columnDefs} />
                    </div>
                </div>
            </Loader>
        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({
    getServerSideProps: async (ctx) => {

        const workflows = await db.workflow.findMany({
            select: {
                uuid: true,
                id: true,
                name: true
            },
            orderBy: {
                id: 'asc'
            }
        })

        const promises = workflows.map(async (workflow) => {

            const taskData = await db.task.findFirst({
                where: {
                    id: workflow.id
                },
                select: {
                    task_questions: {
                        select: {
                            questions: {
                                select: {
                                    id: true,
                                    uuid: true,
                                    name: true,
                                    text: true
                                }
                            }
                        }
                    }
                }
            })

            const questionsData = taskData?.task_questions.map(question => {
                return question.questions
            })

            return {
                workflowUUID: workflow.uuid,
                workflowID: workflow.id,
                workflowName: workflow.name,
                questionsData,
            }
        });

        const questionsData = await Promise.all(promises);

        return {
            props: {
                questionsData: questionsData,
            }
        }
    },
}, member_role.manager);

export default DeliveryPage;