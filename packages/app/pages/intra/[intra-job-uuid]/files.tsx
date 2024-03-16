import DashboardLayout from "@/components/layouts/DashboardLayout";
import intraJobDataUploadSelector from "@/components/CSVUploadSelector";
import {useRouter} from "next/router";
import {data} from "autoprefixer";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import {AgGridReact} from "ag-grid-react";
import FilenameRenderer from "@/components/renderer/FilenameRenderer";
import UrlRenderer from "@/components/renderer/UrlRenderer";
import DateFromNowRenderer from "@/components/renderer/DateFromNowRenderer";
import Loader from "@/components/Loader";
import React, {useMemo, useRef} from "react";
import useSWR from "swr";
import Head from "next/head";
import Link from "next/link";


const CreateNewIntraPair = () => {

    const intraJobUuid = useRouter().query["intra-job-uuid"] as string;

    const {data: intraJobData, error: intraJobError, isLoading: intraJobIsLoading} = useSWR<any>(`/api/v1/intra/${intraJobUuid}/files`);

    const referenceAudios = useMemo(() => {
        return intraJobData?.filter((file: any) => file.is_reference) || [];
    },[intraJobData]);

    const subjectAudios = useMemo(() => {
        return intraJobData?.filter((file: any) => !file.is_reference) || [];
    },[intraJobData]);

    const data = useMemo(() => [...referenceAudios, ...subjectAudios], [referenceAudios, subjectAudios]);


    return (
        <DashboardLayout currentPage={"intra check"} secondaryNav={<></>}>

            <Head>
                <title>intraJobData for Intra Pair Task</title>
            </Head>

            <div>

                <div className={"flex justify-between items-center"}>
                    <div className={"pl-4"}>
                        <h1 className={"text-xl font-semibold"}>
                            List of intraJobData for Intra Pair Task
                        </h1>
                        <p>
                            Here you can see all the intraJobData that are currently in the system.
                        </p>
                    </div>
                    <div>
                        <Link href={`/intra/${intraJobUuid}/examine`}>
                            <button className={"btn btn-secondary  btn-md "}>Exam Link</button>
                        </Link>
                    </div>
                </div>

                <div>
                    <Loader isLoading={intraJobIsLoading} error={(!intraJobData) && !intraJobIsLoading ? "Failed to load data" : undefined}>
                        <div className={"w-full h-[760px] p-4 "}>
                            <AgGridReact
                                rowData={data}
                                suppressMenuHide={true}
                                // pagination={true}
                                // paginationPageSize={15}
                                rowSelection='multiple'
                                groupDefaultExpanded={-1}
                                animateRows={true}
                                columnDefs={[
                                    {headerName: "File Name", field: "file_name", sortable: true, filter: true, resizable: true, width: 450},
                                    {headerName: "Url", field: "file", sortable: true, filter: true, resizable: true, cellRenderer: UrlRenderer},
                                    {headerName: "Created At", field: "createdAt", sortable: true, filter: true, resizable: true, cellRenderer: DateFromNowRenderer},
                                    {headerName: "Is Reference", field: "is_reference", sortable: true, filter: true, resizable: true},
                                    {headerName: "Is Similar", field: "is_similar", sortable: true, filter: true, resizable: true},
                                    {headerName: "Cosine Similarity", field: "cosine_score", sortable: true, filter: true, resizable: true},
                                    {headerName: "Confidence", field: "confidence", sortable: true, filter: true, resizable: true},

                                ]} />
                        </div>
                    </Loader>
                </div>


            </div>
        </DashboardLayout>
    )
}

export default CreateNewIntraPair;