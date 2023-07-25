import React, { useEffect, useRef } from 'react';
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { AgGridReact } from "ag-grid-react";
import useSWR from "swr";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import FileTypeRenderer from '@/components/renderer/FileTypeRenderer';
import DateFromNowRenderer from '@/components/renderer/DateFromNowRenderer';
import { AgGridReact as AgGridReactType } from 'ag-grid-react/lib/agGridReact'
import 'ag-grid-enterprise';

import UrlRenderer from '@/components/renderer/UrlRenderer'
import { member_role, Prisma } from "@prisma/client";
import Modal from "@/components/Modal";
import axios from "axios";
import Loader from "@/components/Loader";
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import FilenameRenderer from "@/components/renderer/FilenameRenderer";
import fileDurationFormatter from "@/helpers/react/fileDurationFormatter";
import FileAssignmentTooltip from "@/components/renderer/FileAssignmentTooltip";
import { ITooltipParams } from "ag-grid-community";
import { toast } from 'react-toastify';

interface TaskPageProps {
    files: any[]
}

function getSelectedRegionsCount(selectedRows: { district: string }[]) {
    const selectedRegionsMap = new Map<string, number>();

    selectedRows.forEach((row) => {
        if (selectedRegionsMap.has(row.district)) {
            const prevCount = selectedRegionsMap.get(row.district) || 0;
            selectedRegionsMap.set(row.district, prevCount + 1);
        } else {
            selectedRegionsMap.set(row.district, 1);
        }
    });

    return selectedRegionsMap.size;
}

function getSelectedDistricts(selectedRows: { district: string }[]) {
    const selectedDistricts = new Set<string>();
    selectedRows.forEach((row) => {
        selectedDistricts.add(row.district);
    });

    return selectedDistricts;
}


const TaskPage = (_props: TaskPageProps) => {

    const fileGridRef = useRef<AgGridReactType>(null);
    const memberGridRef = useRef<AgGridReactType>(null);

    const filterTimerRef = useRef<any>(null);

    const router = useRouter();

    const [assignModalError, setAssignModalError] = React.useState<string | null>(null);
    const [assignDialogOpenDelete, setAssignDialogOpenDelete] = React.useState<boolean>(false);
    const [assignDialogOpen, setAssignDialogOpen] = React.useState<boolean>(false);

    const [selectedRegionsCount, setSelectedRegionsCount] = React.useState<number>(0);

    const [selectionCount, setSelectionCount] = React.useState<number>(0);
    const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
    const [currentPage, setCurrentPage] = React.useState<number>(0);
    const [delData, setDelData] = React.useState<any>({})
    const selectionTimer = useRef<any>(null);

    const workflowUUID = router.query["workflow-uuid"] as string;

    const { data: workflowDetails } = useSWR<Prisma.workflowSelect>(`/api/v1/${workflowUUID}/get-metadata`);

    const { data, error, isLoading, mutate } = useSWR(`/api/v1/${workflowUUID}/task/all`, (url) => fetch(url).then(res => res.json()));
    const files = data || [];

    const { data: members, error: membersError, isLoading: membersLoading } = useSWR<Prisma.memberSelect[]>(`/api/v1/member`, (url) => fetch(url).then(res => res.json()));
    console.log("members", members)
    useEffect(() => {
        return () => {
            clearTimeout(filterTimerRef.current);
            clearTimeout(selectionTimer.current);
        }
    }, []);

    if (error || membersError) {
        return <div>Error fetching</div>
    }

    const handleDialogClose = () => {
        setAssignDialogOpen(false);
        setSelectedRegionsCount(0);
        setAssignDialogOpenDelete(false)
    }

    const handleInitiateAssign = () => {

        console.log("Initiate assign")

        if (!fileGridRef.current) {
            return null;
        }

        const selectedRows = fileGridRef.current.api.getSelectedRows();
        if (selectedRows.length === 0) {
            //Todo: Show error
            console.log("Please select some task")
            return
        }

        setSelectedRegionsCount(getSelectedRegionsCount(selectedRows));

        console.log(workflowDetails);
        if (workflowDetails && workflowDetails?.enforce_region) {
            const selectedDistricts = getSelectedDistricts(selectedRows);
            if (selectedDistricts.size > 1) {
                setAssignModalError("You can only assign files from a single region");
                return null;
            }

            console.log(selectedDistricts);

            clearTimeout(filterTimerRef.current);
            filterTimerRef.current = setTimeout(() => {
                memberGridRef.current?.api?.setFilterModel(null);
                memberGridRef.current?.api?.setFilterModel({
                    district: {
                        filterType: "text",
                        type: "startsWith",
                        values: Array.from(selectedDistricts)
                    }
                });
            }, 100);
        }

        setAssignDialogOpen(true);
    }

    const handleAssign = async () => {

        if (!fileGridRef.current || !memberGridRef.current) {
            setAssignModalError("Something went wrong. Page not loaded properly");
            return null;
        }

        const selectedRows = fileGridRef.current?.api.getSelectedRows();
        const selectedMembers = memberGridRef.current?.api.getSelectedRows();

        if (selectedRows.length === 0 || selectedMembers.length === 0) {
            setAssignModalError("Please select some member | task");
            return null;
        }

        setAssignModalError(null);

        const selectedMemberUUID: string = selectedMembers[0].uuid;
        console.log(selectedRows.map((row) => row.uuid));
        console.log({ selectedMemberUUID })

        try {
            await axios.put(`/api/v1/${workflowUUID}/task/assign`, {
                "taskAssingments-uuids": selectedRows.map((row) => row.uuid),
                "assignee-uuid": selectedMemberUUID,
            });
            await mutate();
            toast.success("Files Re-assinged succefully to " + `${selectedMembers[0].name}`);
            setTimeout(() => {
                fileGridRef.current?.api.forEachNode((node) => {
                    // console.log(node.data?.uuid, selectedItems);
                    if (selectedItems.includes(node.data?.uuid)) {
                        node.setSelected(true);
                    }
                });
                fileGridRef.current?.api.paginationGoToPage(currentPage);
            }, 100);
        } catch (e) {
            console.log(e);
            toast.error("Failed");
        }
        setAssignDialogOpen(false);
    }

    const handleInitiateDelete = () => {

        console.log("Initiate Delete")

        if (!fileGridRef.current) {
            return null;
        }

        const selectedRows = fileGridRef.current.api.getSelectedRows();
        if (selectedRows.length === 0) {
            //Todo: Show error
            console.log("Please select some task")
            return
        }

        setDelData(selectedRows);

        setSelectedRegionsCount(getSelectedRegionsCount(selectedRows));

        console.log(workflowDetails);
        if (workflowDetails && workflowDetails?.enforce_region) {
            const selectedDistricts = getSelectedDistricts(selectedRows);
            if (selectedDistricts.size > 1) {
                setAssignModalError("You can only assign files from a single region");
                return null;
            }

            console.log(selectedDistricts);

            clearTimeout(filterTimerRef.current);
            filterTimerRef.current = setTimeout(() => {
                memberGridRef.current?.api?.setFilterModel(null);
                memberGridRef.current?.api?.setFilterModel({
                    district: {
                        filterType: "text",
                        type: "startsWith",
                        values: Array.from(selectedDistricts)
                    }
                });
            }, 100);
        }

        setAssignDialogOpenDelete(true)
    }

    const handleDelete = async () => {
        if (!fileGridRef.current) {
            setAssignModalError("Something went wrong. Page not loaded properly");
            return null;
        }

        const selectedRows = fileGridRef.current?.api.getSelectedRows();

        if (selectedRows.length === 0) {
            setAssignModalError("Please select some member | task");
            return null;
        }

        setAssignModalError(null);
        console.log(selectedRows.map((row) => row.uuid));

        try {
            await axios.delete(`/api/v1/${workflowUUID}/task/assign`, {
                params: {
                    "task-assignment-uuids": selectedRows.map((row) => row.uuid)
                }
            })
            await mutate()
            toast.success("Task Assingment deleted succefully");
            setAssignDialogOpenDelete(false)
        }
        catch (error) {
            toast.error("Failed");
            console.log(error)
        }
    }

    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"jobs"} workflowUUID={workflowUUID} />}>
            <Head>
                <title>Tasks</title>
            </Head>

            <Modal open={assignDialogOpenDelete}
                onClose={handleDialogClose}
            >
                <div>
                    <h2 className='pb-2'>Are you sure you want to delete these assignments?</h2>
                    <Loader isLoading={membersLoading}>
                        <div className="mt-2 flex flex-col h-60 ag-theme-balham-dark">
                            <AgGridReact
                                rowData={delData}
                                suppressMenuHide={true}
                                pagination={true}
                                ref={memberGridRef}
                                rowSelection='single'
                                paginationPageSize={6}
                                groupSelectsChildren={true}
                                groupDefaultExpanded={-1}
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
                                columnDefs={[
                                    {
                                        headerName: "State",
                                        field: "workflow_file.state",
                                        sortable: true,
                                        filter: true,
                                    },
                                    {
                                        headerName: "District",
                                        field: "workflow_file.district",
                                        sortable: true,
                                        filter: true,
                                    },
                                    {
                                        headerName: "File Name",
                                        field: "workflow_file.file_name",
                                        sortable: true,
                                        filter: true,
                                    },
                                    {
                                        headerName: "Assignee Name",
                                        field: "assignee.name",
                                        sortable: true,
                                        filter: true,
                                    },
                                    {
                                        headerName: "Assignee Name",
                                        field: "assignee.phone",
                                        sortable: true,
                                        filter: true,
                                    },
                                    {
                                        headerName: "Email",
                                        field: "assignee.email",
                                        sortable: true,
                                        filter: true,
                                    }
                                ]}
                            />
                        </div>
                    </Loader>
                    <div className='mt-4 flex justify-end'>
                        <div className='btn-group'>
                            <button className='btn btn-sm btn-primary' onClick={handleDialogClose} >No</button>
                            <button className='btn btn-sm btn-error' onClick={handleDelete} >yes</button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal open={assignDialogOpen}
                onClose={handleDialogClose}
                title={"Reassign Files"}
                description={"Reassign the selected files to a member"}
            >
                <div className="flex flex-col">
                    <div className={"border flex justify-between items-center p-1 pl-4 rounded-xl"}>
                        <div className={"text-sm font-normal flex gap-4"}>
                            <p>
                                <span className={"font-semibold"}>{fileGridRef.current?.api.getSelectedRows().length}</span> Files Selected from  <span className={"font-semibold"}>{selectedRegionsCount}</span> District(s)
                            </p>
                        </div>
                        <div>
                            <button className={"btn btn-sm btn-error"} onClick={handleDialogClose}>
                                Modify Selection
                            </button>
                        </div>
                    </div>
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
                                groupSelectsChildren={true}
                                groupDefaultExpanded={-1}
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
                            <button className={"btn btn-sm btn-ghost"} onClick={handleDialogClose}>
                                Cancel
                            </button>
                            <button className={"btn btn-sm px-8 btn-primary"} onClick={handleAssign}>
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            <div>
                <div className={"mt-2 flex justify-between"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 id={""} className={"text-xl font-semibold"}>
                            Tasks
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Tasks assigned to different users.
                        </p>
                    </div>
                    <div className={"flex items-center mr-5 btn-group gap-2"}>
                        <div>
                            Selected Files: <span className={"font-semibold"}>{selectionCount}</span>
                        </div>
                        <div className='btn-group'>
                            {/* onClick={() => handleReassignModal(data)}
                        onClick={() => handleModalDelete(data)} */}
                            <button className='btn btn-sm btn-secondary' onClick={handleInitiateAssign}  >Reassign</button>
                            <button className='btn btn-sm btn-error' onClick={handleInitiateDelete} >Delete</button>
                        </div>
                    </div>
                </div>
                <Loader isLoading={isLoading}>
                    <div className={"w-full h-[760px] p-4 ag-theme-alpine-dark"}>
                        <AgGridReact
                            rowData={files}
                            suppressMenuHide={true}
                            pagination={true}
                            groupDefaultExpanded={-1}
                            groupSelectsFiltered={true}
                            ref={fileGridRef}
                            rowGroupPanelShow={"onlyWhenGrouping"}
                            sideBar={{ toolPanels: ["columns", "filters"], hiddenByDefault: false }}
                            groupSelectsChildren={true}
                            onPaginationChanged={(pageChangeEvent) => {
                                setCurrentPage(pageChangeEvent.api.paginationGetCurrentPage());
                            }
                            }
                            onSelectionChanged={() => {
                                setSelectionCount(fileGridRef.current?.api.getSelectedRows().length || 0);
                                setSelectedItems(fileGridRef.current?.api.getSelectedRows().map(node => {
                                    return node.uuid;
                                }) || []);
                            }}
                            onGridReady={(params) => {
                                params.api.sizeColumnsToFit();
                            }}
                            rowSelection='multiple'
                            paginationPageSize={15}
                            defaultColDef={{
                                flex: 1,
                                minWidth: 150,
                                // allow every column to be aggregated
                                enableValue: true,
                                resizable: true,
                                // allow every column to be grouped
                                enableRowGroup: true,
                                // allow every column to be pivoted
                                enablePivot: true,
                                sortable: true,
                                filter: true,
                            }}
                            columnDefs={[
                                { headerName: "", checkboxSelection: true, width: 80, headerCheckboxSelection: true, headerCheckboxSelectionFilteredOnly: true },
                                { headerName: 'File State', field: 'workflow_file.state', rowGroup: true },
                                { headerName: 'File District', field: 'workflow_file.district', rowGroup: true },
                                { headerName: 'File Name', field: 'workflow_file.file_name', cellRenderer: FilenameRenderer, width: 450 },
                                { headerName: "Vendor", field: "workflow_file.vendor", sortable: true, filter: true, width: 150 },
                                {
                                    headerName: 'Assinged At', field: 'createdAt',
                                    // cellRenderer: DateFromNowRenderer
                                    cellRenderer: (params: any) => {
                                        const createdAt: string = params.value;
                                        let formattedDate: string = '';

                                        if (createdAt) {
                                            const date: Date = new Date(createdAt);
                                            const day: string = date.getDate().toString().padStart(2, '0');
                                            const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
                                            const year: number = date.getFullYear();
                                            formattedDate = `${day}/${month}/${year}`;
                                        }

                                        return formattedDate;
                                    },
                                    width: 120
                                },
                                {
                                    headerName: "File Received at", field: "workflow_file.receivedAt", sortable: true, filter: true,
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
                                { headerName: 'Assignee Name', field: 'assignee.name' },
                                { headerName: 'Assignee Email', field: 'assignee.email' },
                                { headerName: 'Assignee Ph.no', field: 'assignee.phone' },
                                { headerName: 'Assignee District', field: 'assignee.district' },
                                { headerName: 'Assignee State', field: 'assignee.state' },
                            ]}
                        />
                    </div>
                </Loader>
            </div>
        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({}, member_role.associate);

export default TaskPage;