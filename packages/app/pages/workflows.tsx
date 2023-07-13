import React from 'react';

import {BeakerIcon, QuestionMarkCircleIcon, UsersIcon} from '@heroicons/react/outline';
import clsx from 'clsx';
import {db} from "@/helpers/node/db";

import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from "next/head";
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";
import {member_role} from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";

interface WorkflowItems {
    uuid?: string;
    title: string;
    description: string;
    iconForeground: string;
    iconBackground: string;
    href: string;
    icon?: any;
}

const actions: WorkflowItems[] = [
    {
        title: 'Create & View Members',
        href: '/members',
        icon: UsersIcon,
        iconForeground: 'text-rose-700',
        description: 'Create and view members of your which are can become part of the workflow as well as to manage them.',
        iconBackground: 'bg-rose-50',
    },
    {
        title: 'Create & View Questions',
        href: '/questions',
        icon: QuestionMarkCircleIcon,
        iconForeground: 'text-indigo-700',
        description: 'Create and view questions which are used to create the tasks. These questions can be used in multiple workflows.',
        iconBackground: 'bg-indigo-50',
    },
]

interface WorkflowProps {
    workflows: WorkflowItems[];
}
const Workflows = (props: WorkflowProps) => {

    const workflows: WorkflowItems[] = props?.workflows as WorkflowItems[];

    const allWorkflows: WorkflowItems[] = [...workflows, ...actions];

    return (
        <DashboardLayout currentPage={"workflows"} secondaryNav={<></>}>
            <Head>
                <title>Workflows</title>
            </Head>
            <div className={"mt-4"}>

                <div className={"p-0 md:pl-4"}>
                    <h1 className={"text-2xl font-bold"}>
                        Workflows
                    </h1>
                    <p className={"font-thin text-sm"}>
                        Workflows are a series of steps that you can use to automate your work.
                        Select a workflow to which you are interested in.
                    </p>
                </div>

                <div className="mt-8 divide-y divide-gray-200 overflow-hidden rounded-lg  shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
                    {allWorkflows.map((action, actionIdx) => (
                        <div
                            key={action.title}
                            className={clsx(
                                actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
                                actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
                                actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
                                actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
                                'relative group p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 bg-zinc-700 hover:bg-zinc-900 bg-opacity-5'
                            )}
                        >
                            <div>
                                <span
                                    className={clsx(
                                        action.iconBackground,
                                        action.iconForeground,
                                        'rounded-lg inline-flex p-3 ring-4 ring-white bg-opacity-15'
                                    )}
                                >
                                    {action.icon ? <action.icon className="h-6 w-6" aria-hidden="true" /> : <BeakerIcon className="h-6 w-6" aria-hidden="true" />}
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <a href={action.href} className="focus:outline-none">
                                        {/* Extend touch target to entire panel */}
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        {action.title}
                                    </a>
                                </h3>
                                <p className="mt-2 text-sm">
                                    {action.description}
                                </p>
                            </div>
                            <span
                                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                                aria-hidden="true"
                            >
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                                </svg>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

Workflows.propTypes = {

};

export const getServerSideProps = withAuthorizedPageAccess({
    getServerSideProps: async () => {

        const logger = getLogger("/pages/workflows");

        logger.debug("Finding all workflows");


        const workflows = await db.workflow.findMany({
            orderBy: {
                createdAt: 'asc'
            }
        });

        logger.debug(`Found workflows: ${workflows.length}`);

        const modeledWorkflows: WorkflowItems[] = workflows.map((workflow) => {
            const tWorkflow: WorkflowItems = {
                title: workflow.name,
                description: workflow.desc as string,
                iconForeground: 'text-teal-700',
                iconBackground: 'bg-teal-50',
                href: `/${workflow.uuid}/dashboard`,
            }
            return tWorkflow;
        })

        

        return {
            props: {
                workflows: modeledWorkflows
            }
        }

    }
}, member_role.associate);

export default Workflows;