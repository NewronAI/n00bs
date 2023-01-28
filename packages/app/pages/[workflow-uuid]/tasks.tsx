import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import { AgGridReact  } from "ag-grid-react";
import moment from "moment/moment";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import useSWR from "swr";
import Loader from '@/components/Loader';
import { ClipLoader } from 'react-spinners';


interface TaskFilesPage {
    file:any;
}

const Tasks = (props:TaskFilesPage) => {

    const gridRef = useRef<AgGridReact>(null)


    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;

    const { data, error, isLoading } = useSWR(`/api/v1/${workflowUUID}/task`, (url) => fetch(url).then(res => res.json()));
    console.log(data);
    const Task = data || [];

    if (error) {
        return <div>Error fetching</div>
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">
            <ClipLoader size={50} color={'#123abc'} />
        </div>;
    }

    const handleClick = () => {
        if(!gridRef.current){
            return null;
        }
        
        if(gridRef.current.api.getSelectedRows().length === 0) {
            console.log("Please add some task")
            return
        }
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
                      columnDefs={[
                        {headerName:'id'}
                    ]}

                    />
                </div>
            </div>


            <pre>{JSON.stringify(Task, null, 2)}</pre>

        </DashboardLayout>
    );
};


export default Tasks;