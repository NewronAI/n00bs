import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from "next/head";
import { member_role } from "@prisma/client";
import CreateUpdateQuestion from "@/components/CreateUpdateQuestion";



import Loader from '@/components/Loader';
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import {db} from "@/helpers/node/db";



const ReportPage = () => {

    return (
        <DashboardLayout currentPage={"report"} secondaryNav={<></>}>
            <Loader isLoading={false}>
                <Head>
                    <title>Report</title>
                </Head>

                <div className={"mt-2"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 className={"text-2xl font-bold"}>
                            Report
                        </h1>
                        <p className={"font-thin text-sm"}>
                            Combined report of all the workflows.
                        </p>
                    </div>

                    <div>

                    </div>
                </div>
            </Loader>


        </DashboardLayout>
    );
};




export const getServerSideProps = withAuthorizedPageAccess({
    getServerSideProps: async (ctx) => {

        const workflows = await db.workflow.findMany({
            include: {
                tasks : true
            }
        });



    },
}, member_role.manager);

export default ReportPage;