import React, { useRef } from 'react';
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
import { member_role } from "@prisma/client";
import Loader from '@/components/Loader';
import { ClipLoader } from 'react-spinners';
import { ICellRendererParams } from 'ag-grid-community';


interface TaskFilesPage {
    file: any;
}

const Tasks = (props: TaskFilesPage) => {

    const gridRef = useRef<AgGridReact>(null)


    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;

    const { data, error, isLoading } = useSWR(`/api/v1/${workflowUUID}/task/all`, (url) => fetch(url).then(res => res.json()));
    console.log(data);
    const task = data || [];



    if (error) {
        return <div>Error fetching</div>
    }
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">
            <ClipLoader size={50} color={'#123abc'} />
        </div>;
    }
    // const handleDelete = (e) => {
    //     console.log(e)
    // }
    // const handleUpdate = (e) => {
    //     console.log(e)
    // }

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
                        animateRows={true}
                        paginationPageSize={15}
                        suppressMenuHide={true}
                        rowSelection='multiple'
                        columnDefs={[
                            { headerName: 'Assignee Name', field: 'assignee.name',sortable: true, filter: true, },
                            { headerName: 'Assignee Email', field: 'assignee.email' ,sortable: true, filter: true,},
                            { headerName: 'Assignee State', field: 'assignee.state' ,sortable: true, filter: true,},
                            { headerName: 'Assignee Role', field: 'assignee.role',sortable: true, filter: true, },
                            { headerName: 'Assignee created', field: 'assignee.createdAt',sortable: true, filter: true, },
                            { headerName: 'Assignee district', field: 'assignee.district',sortable: true, filter: true, },

                            
                            { headerName: 'Task Name', field: 'task.name',sortable: true, filter: true, },
                            { headerName: 'Task Created ', field: 'task.createdAt' ,sortable: true, filter: true,},
                            { headerName: 'Task Updated ', field: 'task.updatedAt' ,sortable: true, filter: true,},
                            { headerName: 'Task Status ', field: 'task.status' ,sortable: true, filter: true,},


                            { headerName: 'File Name', field: 'workflow_file.file_name' ,sortable: true, filter: true,},
                            { headerName: 'File Type', field: 'workflow_file.file_type' ,sortable: true, filter: true,},
                            // { headerName: 'File duration', field: 'workflow_file.file_duration' ,sortable: true, filter: true,},
                            { headerName: 'File Created', field: 'workflow_file.createdAt' ,sortable: true, filter: true,},
                            { headerName: 'File Updated', field: 'workflow_file.updatedAt' ,sortable: true, filter: true,},
                            { headerName: 'File Status', field: 'workflow_file.status' ,sortable: true, filter: true,},
                            { headerName: 'Workflow File', field: 'workflow_file.file' ,sortable: true, filter: true,},
                            { headerName: 'district', field: 'workflow_file.district' ,sortable: true, filter: true,},
                            { headerName: 'State', field: 'workflow_file.state' ,sortable: true, filter: true,},  
                            
                            {
                                headerName: 'Action', field: 'button', cellRendererFramework: (params: ICellRendererParams) => <div>
                                    <button className={"btn btn-sm btn-ghost"}>Delete</button>
                                    <button className={"btn btn-sm btn-ghost "}>Update</button>
                                </div>
                            }
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