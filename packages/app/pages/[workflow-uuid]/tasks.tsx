import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import { AgGridReact } from "ag-grid-react";
import moment from "moment/moment";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import useSWR from "swr";
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import {member_role} from "@prisma/client";
import Loader from '@/components/Loader';
import { ClipLoader } from 'react-spinners';


interface TaskFilesPage {
    file: any;
    defaultColDef: boolean;
}

const Tasks = (props: TaskFilesPage) => {

    const gridRef = useRef<AgGridReact>(null)


    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;

    const { data, error, isLoading } = useSWR(`/api/v1/${workflowUUID}/task/all`, (url) => fetch(url).then(res => res.json()));
    console.log(data);
    const task = data || [];

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true
    }), []);

    if (error) {
        return <div>Error fetching</div>
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">
            <ClipLoader size={50} color={'#123abc'} />
        </div>;
    }

  const handleDelete=(e)=>{
    console.log(e)
  }
  const handleUpdate=(e)=>{
    console.log(e)
  }




    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"tasks"} workflowUUID={workflowUUID} />}>
            <Head>
                <title>Tasks</title>
            </Head>

            <div>
                <div className={"mt-2 flex justify-between"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 className={"text-2xl font-bold"}>
                            Tasks
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Tasks assigned to different users.
                        </p>
                    </div>

                    <div className={"flex items-center"}>
                    </div>


                </div>
                <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
                    <AgGridReact
                        rowData={task}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        rowSelection='multiple'
                        columnDefs={[
                            { headerName: 'Task Name', field: 'task.name' },
                            { headerName: 'Created At', field: 'createdAt' },
                            { headerName: 'district', field: 'workflow_file.district' },
                            { headerName: 'State', field: 'workflow_file.state' },
                            { headerName: 'Name', field: 'assignee.name' },
                            { headerName: 'Email', field: 'assignee.email' },
                            { headerName: 'district', field: 'assignee.district' },
                            { headerName: 'State', field: 'assignee.state' },
                            { headerName: 'Action', field: 'button',cellRendererFramework: (params)=> <div>
                                <button onClick={handleDelete} className={"btn btn-sm btn-ghost"}>Delete</button>
                                <button className={"btn btn-sm btn-ghost "}>Edit</button>
                                </div>}
                        ]}
                    />
                </div>
            </div>


            {/* <pre>{JSON.stringify(task, null, 2)}</pre> */}

        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({}, member_role.manager);

export default Tasks;