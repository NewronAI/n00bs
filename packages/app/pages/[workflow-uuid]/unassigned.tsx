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

interface UnassignedFilesPageProps {
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


const UnassignedFilesPage = (_props: UnassignedFilesPageProps) => {

    const fileGridRef = useRef<AgGridReactType>(null);
    const memberGridRef = useRef<AgGridReactType>(null);

    const filterTimerRef = useRef<any>(null);

    const router = useRouter();

    const [assignModalError, setAssignModalError] = React.useState<string | null>(null);

    const [assignDialogOpen, setAssignDialogOpen] = React.useState<boolean>(false);

    const [selectedRegionsCount, setSelectedRegionsCount] = React.useState<number>(0);

    const [selectionCount, setSelectionCount] = React.useState<number>(0);
    const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
    const [currentPage, setCurrentPage] = React.useState<number>(0);
    const [assignLimit, setAssignLimit] = React.useState(50);
    const selectionTimer = useRef<any>(null);

    const workflowUUID = router.query["workflow-uuid"] as string;

    const { data: workflowDetails } = useSWR<Prisma.workflowSelect>(`/api/v1/${workflowUUID}/get-metadata`);

    const { data, error, isLoading, mutate } = useSWR<Prisma.workflow_fileSelect[]>(`/api/v1/${workflowUUID}/file/unassigned`, (url) => fetch(url).then(res => res.json()));
    const files = data || [];

    const { data: members, error: membersError, isLoading: membersLoading } = useSWR<Prisma.memberSelect[]>(`/api/v1/member`, (url) => fetch(url).then(res => res.json()));
    console.log("members", members)

    clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => {
        fileGridRef.current?.api?.setFilterModel(null);
        fileGridRef.current?.api?.setFilterModel({
            assignment_count: {
                filterType: "text",
                type: "startsWith",
                values: ["0"]
            }
        });
    }, 100);


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

        const filteredRows = selectedRows.slice(0, assignLimit);

        console.log({ filteredRows });

        setAssignModalError(null);

        const selectedMemberUUID: string = selectedMembers[0].uuid;

        try {
            await axios.post(`/api/v1/${workflowUUID}/task/assign`, {
                "workflow-file-uuids": filteredRows.map((row) => row.uuid),
                "assignee-uuid": selectedMemberUUID,
            });
            await mutate();
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

        }

        setAssignDialogOpen(false);
    }

    const columnDefs = [
        { headerName: "", checkboxSelection: true, width: 80, headerCheckboxSelection: true, headerCheckboxSelectionFilteredOnly: true },
        { headerName: "File Duration", field: "file_duration", sortable: true, filter: true, aggFunc: 'sum', valueFormatter: fileDurationFormatter, width: 150 },
        { headerName: "Type", field: "file_type", sortable: true, cellRenderer: FileTypeRenderer, width: 100 },
        { headerName: "File Name", field: "file_name", sortable: true, filter: true, width: 400, cellRenderer: FilenameRenderer, tooltipField: "file_name" },
        { headerName: "Vendor", field: "vendor", sortable: true, filter: true, width: 150 },
        {
            headerName: "Assignments", field: "assignment_count", sortable: true, filter: true, width: 170,
            tooltipField: "assignment_count",
            tooltipComponent: (props: ITooltipParams) => (<FileAssignmentTooltip {...props} workflowUUID={workflowUUID} />)
        },
        { headerName: "File Path", field: "file", sortable: true, filter: true, width: 500, cellRenderer: UrlRenderer },
        // {headerName: "File Status", field: "status", sortable: true, filter: true, width: 120},
        // {headerName: "File UUID", field: "uuid", sortable: true, filter: true, width: 330},
        { headerName: "State", field: "state", sortable: true, filter: true, rowGroup: true },
        { headerName: "District", field: "district", sortable: true, filter: true, rowGroup: true, },
        { headerName: "Created at", field: "createdAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 120 },
        { headerName: "Received at", field: "receivedAt", sortable: true, filter: true, cellRenderer: DateFromNowRenderer, width: 130 },
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
            width: 150
        },
    ]

    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"unassigned files"} workflowUUID={workflowUUID} />}>
            <Head>
                <title>Unassigned Files</title>
            </Head>

            <Modal open={assignDialogOpen}
                onClose={handleDialogClose}
                title={"Assign Files"}
                description={"Assign the selected files to a member"}
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
                        <div className="mt-2 flex flex-col h-60 ag-theme-alpine ">
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
                    {selectionCount > assignLimit && <div className='mt-2'>
                        <div className='flex flex-col'>
                            <span>Assigning only {assignLimit} out of {selectionCount} selected files.</span>
                        </div>
                    </div>}
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
                            Unassigned Files
                        </h1>
                        <p className={"font-thin text-sm"}>
                            All the files uploaded to the workflow, which are not assigned to any user.
                        </p>
                    </div>
                    <div className={"flex items-center mr-5 btn-group gap-2"}>
                        <div>
                            Selected Files: <span className={"font-semibold"}>{selectionCount}</span>
                        </div>
                        <button onClick={handleInitiateAssign} className='btn btn-sm btn-secondary px-5'>
                            Assign
                        </button>
                    </div>
                </div>
                <Loader isLoading={isLoading}>
                    <div className={"w-full h-[760px] p-4 ag-theme-alpine "}>
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
                            columnDefs={columnDefs}
                        />
                    </div>
                </Loader>
            </div>
        </DashboardLayout>
    );
};

export const getServerSideProps = withAuthorizedPageAccess({}, member_role.associate);

export default UnassignedFilesPage;