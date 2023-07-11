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


const Flattened_approved_answer = (_props: UnassignedFilesPageProps) => {


  const fileGridRef = useRef<AgGridReactType>(null);
  const router = useRouter();

  const workflowUUID = router.query["workflow-uuid"] as string;
  const { data, error, isLoading } = useSWR<Prisma.workflow_fileSelect[]>(`/api/v1/${workflowUUID}/answer/answer_accepted`);
  const files = data || [];
  // console.log("files", files)

  const { data: questionData, error: questionFetchError, isLoading: questionFetchLoading } = useSWRImmutable(`/api/v1/${workflowUUID}/question`)
  console.log('questionData', questionData)

  const approvedflattendData: any = []
  files.forEach(file => {
    if (Array.isArray(file.task_assignments)) {
      file.task_assignments?.forEach((task: any) => {
        approvedflattendData.push({ ...file, task_assignments: task });
      })
    }
  })
  console.log("FlattendData", approvedflattendData)

  const staticColumnDefs = [
    { headerName: "File", field: "file_name", cellRenderer: 'agGroupCellRenderer', tooltipField: 'file_name', rowGroup: true },
    { headerName: "Vendor", field: "vendor", sortable: true, filter: true, width: 150 },
    { headerName: "District", field: "district", },
    { headerName: "State", field: "state", },
    { headerName: "File", field: "file", cellRenderer: UrlRenderer },
    { headerName: "Created At", field: "createdAt", cellRenderer: DateFromNowRenderer },
    {
      headerName: "Received at", field: "receivedAt", sortable: true, filter: true,
      cellRenderer: (data: any) => {
        return moment(data.receivedAt).format('MM/DD/YYYY')
      }
      , width: 130

    },
    {
      headerName: "File Received at",
      field: "receivedAt",
      sortable: true,
      filter: true,

      cellRenderer: (data: any) => {
        return moment(data.updateAt).format('MM/DD/YYYY')
      }
      , width: 130
    },
    { headerName: "Assignee Name", field: 'task_assignments.assignee.name', width: 120 },
    { headerName: "Assignee Ph. No", field: 'task_assignments.assignee.phone' },
    {
      headerName: "Answered At", field: 'createdAt',
      cellRenderer: (data: any) => {
        return moment(data.createdAt).format('MM/DD/YYYY')
      }
      , width: 130
    },
  ]


  const dynamicColumnDef = questionData?.map((question: any) => {
    return { headerName: question.name, field: `task_assignments.task_answers.${question.uuid}` }
  }) || [];


  const colDef = [
    ...staticColumnDefs,
    ...dynamicColumnDef,
    ...[{
      headerName: "Rating", field: "task_assignments.review_rating", cellRenderer: RatingViewer
    }]
  ];



  return (
    <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"flattened_view"} workflowUUID={workflowUUID} />} >
      <Head>
        <title>Approved Flattened View</title>
      </Head>
      <div>
        <div className={"mt-2 flex justify-between"}>
          <div className={"p-0 md:pl-4"}>
            <h1 id={""} className={"text-xl font-semibold"}>
              Approved Flattened View
            </h1>
            <p className={"font-thin text-sm"}>
              In the Flattened View, tasks addressed by a team member
            </p>
          </div>
          <div className={"flex items-center mr-5 btn-group"}>
            {/* <ActionItem /> */}
          </div>
        </div>
        <Loader isLoading={isLoading || questionFetchLoading}>
          <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
            <AgGridReact
              rowData={approvedflattendData}
              pagination={true}
              columnDefs={colDef}

              sideBar={{ toolPanels: ["columns", "filters"], hiddenByDefault: false }}
              pivotMode={false}
              rowSelection='multiple'
              rowGroupPanelShow={"onlyWhenGrouping"}
              defaultColDef={{
                flex: 1,
                minWidth: 200,
                enableValue: true,
                enableRowGroup: true,
                enablePivot: true,
                sortable: true,
                filter: true,
                resizable: true,
              }}
            />
          </div>
        </Loader>
      </div>
    </DashboardLayout>
  )
}

export default Flattened_approved_answer