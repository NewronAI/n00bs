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
import { forEach } from 'lodash';

import { Grid, GridOptions, ValueGetterParams } from 'ag-grid-community';


const FlattenedView = () => {
  const router = useRouter();
  const workflowUUID = router.query["workflow-uuid"] as string;

  const [taskRatings, setTaskRatings] = useState(new Map<string, number>())

  const updatedLocalRating = (uuid: string, rating: number) => {
    setTaskRatings((prev: Map<string, number>) => prev.set(uuid, rating));
  }

  const [updatingReview, setUpdatingReviews] = useState(false);
  const [rateBulk, setRateBulk] = useState(true);

  const { data, error, isLoading, mutate } = useSWR<Prisma.workflow_fileSelect[]>(`/api/v1/${workflowUUID}/answer`, { refreshInterval: 24 * 60 * 60 * 1000 });
  console.log("Data:",data)

  const files = data || [];
  // console.log("files", files);

  const flattendData: any = []

  files.forEach(file => {
    if (Array.isArray(file.task_assignments)) {
      file.task_assignments?.forEach((task: any) => {
        flattendData.push({ ...file, task_assignments: task });
      })
    }
  })

  console.log("Answers Data",flattendData)

  // console.log("FlattendData", flattendData)

  const { data: questionData, error: questionFetchError, isLoading: questionFetchLoading } = useSWRImmutable(`/api/v1/${workflowUUID}/question`)
  // console.log("question", questionData)

  async function onCellValueChanged(event: any, questionUUID: string) {
    const newValue = event.newValue;
    const taskAssignmentUUID = event.data.task_assignments.uuid;
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
    { headerName: "File", field: "file_name", cellRenderer: 'agGroupCellRenderer', tooltipField: 'file_name', },
    { headerName: "Vendor", field: "vendor", sortable: true, filter: true, width: 150 },
    { headerName: "District", field: "district", },
    { headerName: "State", field: "state", },
    { headerName: "File", field: "file", cellRenderer: UrlRenderer },
    { headerName: "Assingment Created At", field: "task_assignments.createdAt", cellRenderer: (params: any) => {
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
    // { headerName: "Received at", field: "receivedAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 130 },
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
    { headerName: "Assignee Name", field: 'task_assignments.assignee.name', width: 120 },
    { headerName: "Assignee Ph. No", field: 'task_assignments.assignee.phone' },
    { headerName: "Answered At", field: 'task_assignments.updatedAt', cellRenderer: (params: any) => {
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

  const dynamicColumnDef = Array.isArray(questionData) ?
    questionData.map((question: any) => {
      return {
        headerName: question.name,
        field: `task_assignments.task_answers.${question.uuid}`,
        cellRenderer: SelectRenderer,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: question.options } as ISelectCellEditorParams,
        editable: question.name.includes('Comments') ? false : true,
        onCellValueChanged: (event: any) => onCellValueChanged(event, question.uuid)
      }
    }) : [];

  const colDef = [
    ...staticColumnDefs,
    ...dynamicColumnDef,
    ...[{
      headerName: "Rating ", field: "rating", width: 400, cellRenderer: (props: any) => (<RatingRenderer onRatingChange={(rating, data) => {
        updatedLocalRating(data.task_assignments.uuid, rating)
        console.log("data--------------", data);
      }}
        {...props} oldRating={(data: {
          task_assignments: any; uuid: string;
        }) => taskRatings.get(data.task_assignments.uuid)} />)
    }]
  ];

  const handleRate = () => {
    console.log("taskRatings", taskRatings)
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
    console.log(taskRatings)
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
    <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"flattened_view"} workflowUUID={workflowUUID} />} >
      <Head>
        <title>Flattend view</title>
      </Head>
      <div>
        <div className={"mt-2 flex justify-between"}>
          <div className={"p-0 md:pl-4"}>
            <h1 id={""} className={"text-xl font-semibold"}>
              Unreviewed Flattened View
            </h1>
            <p className={"font-thin text-sm"}>
              In the Flattened View, tasks addressed by a team member
            </p>
          </div>
          <div className={"flex items-center mr-5 btn-group"}>
            <ActionItem />
          </div>
        </div>
        <Loader isLoading={isLoading || questionFetchLoading}>
          <div className={"w-full h-[760px] p-4 ag-theme-alpine "}>
            <AgGridReact
              rowData={flattendData}
              pagination={true}
              columnDefs={colDef}
              // pivotMode={false}
              // gridOptions={gridOptions}
              sideBar={{ toolPanels: ["columns", "filters"], hiddenByDefault: false }}
              pivotMode={false}
              rowSelection='multiple'
              rowGroupPanelShow={"onlyWhenGrouping"}
              defaultColDef={{
                flex: 1,
                minWidth: 200,
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
            />
          </div>
        </Loader>
      </div>
    </DashboardLayout>
  )
}

export default FlattenedView