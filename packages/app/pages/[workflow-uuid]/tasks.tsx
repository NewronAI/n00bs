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
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import useSWR from "swr";
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import Loader from '@/components/Loader';
import { ClipLoader } from 'react-spinners';
import Modal from "@/components/Modal";
import axios from 'axios';
import {member_role, Prisma} from "@prisma/client";
import DateFromNowRenderer from '@/components/renderer/DateFromNowRenderer';
import { AgGridReact as AgGridReactType } from 'ag-grid-react/lib/agGridReact'


interface TaskFilesPage {
    file: any;
    defaultColDef: boolean;
}

const Tasks = (props: TaskFilesPage) => {

    const gridRef = useRef<AgGridReact>(null)
    const memberGridRef = useRef<AgGridReactType>(null);

    const [assignModalError, setAssignModalError] = React.useState<string | null>(null);

    const [assignDialogOpenEdit, setAssignDialogOpenEdit] = React.useState<boolean>(false);
    const [assignDialogOpenDelete, setAssignDialogOpenDelete] = React.useState<boolean>(false);
    const [delData, setDelData] = React.useState<any>({})

    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;

    const { data, error, isLoading, mutate } = useSWR(`/api/v1/${workflowUUID}/task/all`, (url) => fetch(url).then(res => res.json()));
    console.log(data);
    const task = data || [];

    const {data : members, error : membersError, isLoading : membersLoading} = useSWR<Prisma.memberSelect[]>(`/api/v1/member`, (url) => fetch(url).then(res => res.json()));

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

    const handleReassign = async () => {

        if(!memberGridRef.current){
            setAssignModalError("Something went wrong. Page not loaded properly");
            return null;
        }

        const selectedMembers = memberGridRef.current?.api.getSelectedRows();

        if(selectedMembers.length === 0) {
            setAssignModalError("Please select some member | task");
            return null;
        }

        setAssignModalError(null);

        const selectedMemberUUID : string = selectedMembers[0].uuid;

        try {
            await axios.put(`/api/v1/${workflowUUID}/task/assign`, null, {
                params: {
                    "task-assignment-uuid": delData.uuid,
                    "assignee-uuid": selectedMemberUUID,
                }
            });
            await mutate();
            setAssignDialogOpenEdit(false);
        } catch (e) {
            console.log(e);
        }
    }

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/v1/${workflowUUID}/task/assign`, {
                params : {
                    "task-assignment-uuid": delData.uuid
                } 
            })
            await mutate()
            setAssignDialogOpenDelete(false)
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleModalDelete = (data: any) => {
        setAssignDialogOpenDelete(true);
        setDelData(data)
    }

    const handleDialogClose = () => {
        setAssignDialogOpenDelete(false)
        setAssignDialogOpenEdit(false)
    }

    const handleReassignModal = (data: any) => {
        setAssignDialogOpenEdit(true)
        setDelData(data)
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
                <div className={"w-full h-[760px] p-4  ag-theme-alpine-dark"}>
                    <AgGridReact
                        rowData={task}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        rowSelection='multiple'
                        columnDefs={[
                            { headerName: 'Action', field: 'button', cellRenderer: ({data}: {data: any} ) => {
                                return (
                                  <div className='btn-group'> 
                                        <button className='btn btn-xs btn-secondary' onClick={() => handleReassignModal(data)} >Reassign</button>
                                      <button className='btn btn-xs btn-error' onClick={() => handleModalDelete(data)} >Delete</button>
                                  </div>
                                )
                              }
                              },
                            { headerName: 'Task Name', field: 'task.name' },
                            { headerName: 'Created At', field: 'createdAt', cellRenderer: DateFromNowRenderer },
                            { headerName: 'district', field: 'workflow_file.district' },
                            { headerName: 'State', field: 'workflow_file.state' },
                            { headerName: 'Name', field: 'assignee.name' },
                            { headerName: 'Email', field: 'assignee.email' },
                            { headerName: 'district', field: 'assignee.district' },
                            { headerName: 'State', field: 'assignee.state' },
                        ]}
                    />
                </div>
            </div>
            <Modal open={assignDialogOpenDelete}
                   onClose={handleDialogClose}
            >
                <div>
                    <h2 className='pb-2'>Are you sure you want to delete this assignment?</h2>
                    <div className='flex'>
                        <h2>Assignee Name: </h2>
                        <h2>{delData?.assignee?.name}</h2>
                    </div>
                    <div className='flex'>
                        <h2>Assignee Location: </h2>
                        <h2>{delData?.assignee?.district}, {delData?.assignee?.state}</h2>
                    </div>
                    <div className='flex'>
                        <h2>File Name: </h2>
                        <h2>{delData?.workflow_file?.file_name}</h2>
                    </div>
                    <div className='flex'>
                        <h2>File Location: </h2>
                        <h2>{delData?.workflow_file?.district}, {delData?.workflow_file?.state}</h2>
                    </div>
                   <div className='flex justify-end'>
                    <div className='btn-group'>
                        <button className='btn btn-sm btn-primary' onClick={handleDialogClose} >No</button>
                        <button className='btn btn-sm btn-error' onClick={handleDelete} >yes</button>
                    </div>
                    </div>
                </div>
            </Modal>
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
                                    }
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
        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({}, member_role.manager);

export default Tasks;