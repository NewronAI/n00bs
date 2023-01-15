import React, {Fragment, useState} from 'react';

import PropTypes from 'prop-types';
import useSWR from 'swr';
import axios from 'axios';

import { Dialog, Transition } from '@headlessui/react'

import {
    LinkIcon, PlusIcon, QuestionMarkCircleIcon, XIcon
} from '@heroicons/react/outline';
import clsx from 'clsx';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from "next/head";
import MemberItem from "@/interfaces/MemberItem";
import Avatar from "@/components/Avatar";
import {SearchIcon} from "@heroicons/react/solid";
import {member_role, obj_status} from "@prisma/client";
import CreateUpdateQuestion from "@/components/CreateUpdateQuestion";



const Members = ( ) => {


    return (
        <DashboardLayout currentPage={"questions"} secondaryNav={<></>}>
            <Head>
                <title>Questions</title>
            </Head>
            <div className={"mt-2"}>
                <div className={"p-0 md:pl-4"}>
                    <h1 className={"text-2xl font-bold"}>
                        Questions
                    </h1>
                    <p className={"font-thin text-sm"}>
                        All the questions asked to the members. You can also add new questions.
                    </p>
                </div>

            <CreateUpdateQuestion />

            </div>


        </DashboardLayout>
    );
};

Members.propTypes = {

};


export default Members;