import React from 'react';

import WorkflowNav from "@/components/layouts/WorkflowNav";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {useRouter} from 'next/router';
import Head from "next/head";
import useSWR from "swr";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {AgGridReact} from "ag-grid-react";
import axios from 'axios'
import DateFromNowRenderer from "@/components/renderer/DateFromNowRenderer";
import Loader from "@/components/Loader";
import RatingViewer from "@/components/renderer/RatingViewer";


interface MemberFetchSearch {
    search: string
    by: string
}


// const memberFetcher = async ([url, query]: [string, MemberFetchSearch]) => {
//     const urlParams = new URLSearchParams();
//     console.log(query);
//     if (query.search) {
//         urlParams.append(query.by, query.search);
//     }
//     const res = await axios.get(url, {
//         params: urlParams
//     });
//     return res.data;
// }


function Workers() {

    const router = useRouter();

    const workflowUUID = router.query["workflow-uuid"] as string;

    const { data, error,  isLoading, } = useSWR([`/api/v1/${workflowUUID}/workers`]);
    console.log(data,error);
    const member = data || [];


 

    // @ts-ignore
    return (

        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"workers"} workflowUUID={workflowUUID} />}>
            <Head>
                <title>Freelancers</title>
            </Head>

            <div className={"mt-2 flex justify-between"}>
                <div className={"p-0 md:pl-4"}>
                    <h1 className={"text-2xl font-bold"}>
                        Freelancers
                    </h1>
                    <p className={"font-thin text-sm"}>
                        Tasks assigned to different freelancers.
                    </p>
                </div>
            </div>

            <Loader isLoading={isLoading} >
                <div className={"w-full h-[760px] p-4 ag-theme-alpine"}>
                    <AgGridReact
                        rowData={member}
                        pagination={true}
                        rowGroupPanelShow={"onlyWhenGrouping"}
                        sidebar={{toolPanels:["columns", "filters"]}}
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
                            { headerName: 'Name', field: 'name', sortable: true, filter: true, },
                            { headerName: 'Email', field: 'email', sortable: true, filter: true, },
                            { headerName: 'Phone No.', field: 'phone', sortable: true, filter: true, },
                            { headerName: 'Total Assignments', field: 'task_counts', sortable: true, filter: true },
                            // @ts-ignore
                            { headerName: 'Avg Rating', field: 'rating', sortable: true, filter: true , cellRenderer: RatingViewer, valueFormatter: (value : string | number) => typeof value === "string" ? parseFloat(value) : Math.round(value)},
                            { headerName: 'Role', field: 'role', sortable: true, filter: true, },
                            { headerName: 'Status', field: 'status', sortable: true, filter: true, },
                            { headerName: 'Added on', field: 'createdAt', sortable: true, filter: true, cellRenderer: DateFromNowRenderer},
                            { headerName: 'District', field: 'district', sortable: true, filter: true, },
                            { headerName: 'District', field: 'district', sortable: true, filter: true, },
                            { headerName: 'State', field: 'state', sortable: true, filter: true, },
                            { headerName: 'Address', field: 'address', sortable: true, filter: true, },
                            { headerName: 'Pin', field: 'pincode', sortable: true, filter: true, },
                            // { headerName: 'Payment', field: 'payment_details', sortable: true, filter: true, },



                        ]}
                    />
                </div>
            </Loader>
            {/* <pre>{JSON.stringify(member, null, 2)}</pre> */}
        </DashboardLayout>

    )
}

export default Workers