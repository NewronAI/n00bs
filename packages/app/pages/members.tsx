import React, {ReactPropTypes} from 'react';

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-balham.css'; // Optional theme CSS

import PropTypes from 'prop-types';
import useSWR from 'swr';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';

import {
    UsersIcon,
    QuestionMarkCircleIcon,
    BeakerIcon
} from '@heroicons/react/outline';
import clsx from 'clsx';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from "next/head";
import MemberItem from "@/interfaces/MemberItem";


const memberFetcher = async (url : string) => {
    const res = await axios.get(url);
    return res.data;
}

const Members = ( ) => {

    const { data, error } = useSWR('/api/v1/member', memberFetcher);

    const members = data as MemberItem[];

    console.log(members);

    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>

    return (
        <DashboardLayout currentPage={"members"} secondaryNav={<></>}>
            <Head>
                <title>Members</title>
            </Head>
            <div className={"mt-4"}>
                <div className={"p-0 md:pl-4"}>
                    <h1 className={"text-2xl font-bold"}>
                        Members
                    </h1>
                    <p className={"font-thin text-sm"}>
                        Create and manage members of your workflows.
                    </p>
                </div>

                <div className={"w-full min-w-96 h-[600px] dark-theme"}>
                    <AgGridReact
                        rowData={members}
                        columnDefs={[
                            {headerName: "Name", field: "name", sortable: true, filter: true},
                            {headerName: "Email", field: "email", sortable: true, filter: true},
                            {headerName: "Role", field: "role", sortable: true, filter: true},
                            {headerName: "Created At", field: "createdAt", sortable: true, filter: true},
                            // {headerName: "Updated At", field: "updatedAt", sortable: true, filter: true},
                            {headerName: "District", field: "district", sortable: true, filter: true},
                            {headerName: "State", field: "state", sortable: true, filter: true},
                            {headerName: "Phone", field: "phone", sortable: true, filter: true},
                            {headerName: "Address", field: "address", sortable: true, filter: true},
                            {headerName: "Pincode", field: "pincode", sortable: true, filter: true},
                            {headerName: "Status", field: "status", sortable: true, filter: true},

                        ]}
                        />

                </div>


            </div>
        </DashboardLayout>
    );
};

Members.propTypes = {

};


export default Members;