import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import axios from 'axios';
import { toast } from 'react-toastify';

interface UnassignedFilesPageProps {
  files: any[]
}
const Flattened_approved_answer = (_props: UnassignedFilesPageProps) => {

  const fileGridRef = useRef<AgGridReactType>(null);
  const router = useRouter();

  const [loadingAnswers, setLoadingAnswers] = useState<boolean>(true);

  const workflowUUID = router.query["workflow-uuid"] as string;
  const [files, setFiles] = useState<any[]>([]);
  const [questionData, setQuestionData] = useState([])
  console.log("files", files)

  // const { data: approvedflattendData, error, isLoading } = useSWRImmutable<Prisma.workflow_fileSelect[]>(`/api/v1/${workflowUUID}/answer/anwers_accepted_flat`);
  // const files = approvedflattendData || [];

  //const { data: questionData, error: questionFetchError, isLoading: questionFetchLoading } = useSWRImmutable(`/api/v1/${workflowUUID}/question`)
  //console.log('questionData', questionData)

  useEffect(() => {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 1000; // 1 second
    setLoadingAnswers(true);

    const fetchQuestions = () => {
      axios.get(`/api/v1/${workflowUUID}/question`)
        .then((response) => {
          setQuestionData(response.data);
        }).catch((error) => {
          console.error("Error while fetching questions : ", error);
          setLoadingAnswers(true);
        });
    };

    const fetchAnswers = (retryCount: number) => {
      console.log("Retrying Request", retryCount);
      axios.get(`/api/v1/${workflowUUID}/answer/anwers_accepted_flat`)
        .then((response) => {
          if (response.data.length !== 0) {
            setFiles(response.data);
            setLoadingAnswers(false);
          }
        }).catch((error) => {
          console.error("Flattened Approved Fetch Error : ", error);
          setLoadingAnswers(false);
          if (retryCount < MAX_RETRIES && error.response.status === 500) {
            // Retry the request after a delay
            setTimeout(() => fetchAnswers(retryCount + 1), RETRY_DELAY);
          } else {
            toast.error("Failed to fetch approved answers data. Error Code: " + `${error.response.status}`);
          }
        });
    };

    const fetchQuestionsAndAnswers = () => {
      fetchQuestions();
      fetchAnswers(0); // Start with retryCount = 0
    };

    fetchQuestionsAndAnswers();
  }, [workflowUUID]);

  // const approvedflattendData: any = []
  // files.forEach(file => {
  //   if (Array.isArray(file.task_assignments)) {
  //     file.task_assignments?.forEach((task: any) => {
  //       approvedflattendData.push({ ...file, task_assignments: task });
  //     })
  //   }
  // })
  // console.log("FlattendData", approvedflattendData)

  const staticColumnDefs = [
    { headerName: "File", field: "workflow_file.file_name", cellRenderer: 'agGroupCellRenderer', tooltipField: 'file_name', rowGroup: true },
    { headerName: "Vendor", field: "workflow_file.vendor", sortable: true, filter: true, width: 150 },
    { headerName: "District", field: "workflow_file.district", },
    { headerName: "State", field: "workflow_file.state", },
    { headerName: "File", field: "workflow_file.file", cellRenderer: UrlRenderer },
    {
      headerName: "Assinged At", field: "createdAt", cellRenderer: (params: any) => {
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
    },
    // {
    //   headerName: "Received at", field: "receivedAt", sortable: true, filter: true,
    //   cellRenderer: (data: any) => {
    //     return moment(data.receivedAt).format('MM/DD/YYYY')
    //   }
    //   , width: 130

    // },
    {
      headerName: "File Received at",
      field: "workflow_file.createdAt",
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
      }, width: 130
    },
    { headerName: "Assignee Name", field: 'assignee.name', width: 120 },
    { headerName: "Assignee Ph. No", field: 'assignee.phone' },
    {
      headerName: "Answered At", field: 'answerAt',
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
      }, width: 130
    },
    {
      headerName: "Reviewd At", field: "updatedAt", cellRenderer: (params: any) => {
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
    },
  ]


  const dynamicColumnDef = loadingAnswers ? [] : questionData?.map((question: any) => {
    return { headerName: question.name, field: `task_answers.${question.uuid}` }
  }) || [];


  const colDef = [
    ...staticColumnDefs,
    ...dynamicColumnDef,
    ...[{
      headerName: "Rating", field: "review_rating", cellRenderer: RatingViewer
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
        <Loader isLoading={loadingAnswers}>
          <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
            <AgGridReact
              rowData={files}
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
                enableRowGroup: false,
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