import React from 'react';
import clsx from "clsx";
import useSWRImmutable from "swr/immutable";
import { Prisma } from "@prisma/client";
import {
    AnnotationIcon,
    ChartSquareBarIcon,
    CogIcon,
    DocumentDuplicateIcon,
    DocumentIcon,
    DocumentTextIcon,
    UserGroupIcon,
    ViewBoardsIcon
} from "@heroicons/react/outline";

import { Disclosure } from '@headlessui/react'

export interface WorkflowNavProps {
    currentPage?: string;
    workflowUUID?: string;

}


const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: <ChartSquareBarIcon className="h-5" aria-hidden="true" />, current: false, },
    {
        name: 'Files', href: '/all-files', icon: <DocumentDuplicateIcon className="h-5" aria-hidden="true" />, children: [
            { name: 'All Files', href: '/all-files', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
            { name: 'Unassigned Files', href: '/unassigned', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
            { name: 'Assigned Files', href: '/assigned', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
        ]
    },
    { name: 'Tasks', href: '/tasks', icon: <ViewBoardsIcon className="h-5" aria-hidden="true" />, current: false, },
    {
        name: 'Answers', href: '/answers', icon: <ViewBoardsIcon className="h-5" aria-hidden="true" />, children: [
            { name: 'Unreviewed', href: '/answers', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
            { name: 'Unreviewed Flat View', href: '/flattened_view', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
            { name: 'Approved ', href: '/accepted_answers', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
            { name: 'Approved Flat View ', href: '/flattened_approved_answer', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
            { name: 'Disapproved', href: '/rejected_answers', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
        ]
    },
    //{ name: 'Flattened View', href: '/flattenedView', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
    // { name: 'Open Jobs', href: '/jobs' },
    // { name: 'Completed Jobs', href: '/completed-jobs' },
    { name: 'Freelancers', href: '/workers', icon: <UserGroupIcon className="h-5" aria-hidden="true" />, current: false, },
    { name: 'Settings', href: '/settings', icon: <CogIcon className="h-5" aria-hidden="true" />, current: false, },
];

const WorkflowNav = (props: WorkflowNavProps) => {

    const { currentPage, workflowUUID } = props;


    const { data: workflow } = useSWRImmutable<Prisma.workflowSelect>(`/api/v1/${workflowUUID}/get-metadata`);



    return (
        // <div className="hidden sm:flex sm:space-x-8">

        //     <div>
        //         <h3 className="inline-flex items-center px-1 pt-1  text-sm font-semibold w-40 truncate">
        //             {workflow?.name} :
        //         </h3>

        //     </div>

        //     {navigation.map((item) => (
        //         <a
        //             key={item.name}
        //             href={`/${workflowUUID}${item.href}`}
        //             className={clsx(
        //                 item.name.toLowerCase() === currentPage
        //                     ? 'border-indigo-500 text-zinc-500 dark:text-zinc-100'
        //                     : 'border-transparent text-zinc-300 dark:text-zinc-200 hover:border-gray-300 hover:text-zinc-100',
        //                 'inline-flex items-center px-1 pt-1 pb-1 border-b-2 text-sm font-thin flex gap-2'
        //             )}
        //             aria-current={item.name === currentPage ? 'page' : undefined}
        //         >
        //             {item?.icon}
        //             {item.name}
        //         </a>
        //     ))}
        // </div>


        //----------------------------------------------------------------------------------------------------------------------------------
        <div className="flex flex-grow flex-col overflow-y-auto  border-r border-gray-800 pt-5 pb-4">
            <div className="bg-gray-200 text-gray-800 group flex w-48 items-center rounded-md py-2 pl-5 pr-1 text-sm font-medium px-4 mr-1">
                <a href="#" >{workflow?.name}</a>
            </div>
            <div className="mt-5 flex flex-grow flex-col">
                <nav className="flex-1 space-y-1 px-2" aria-label="Sidebar">
                    {navigation.map((item) =>
                        !item.children ? (
                            <div key={item.name}>
                                <a
                                    href={`/${workflowUUID}${item.href}`}
                                    className={'text-gray-300  hover:bg-gray-50 hover:text-gray-900 group flex w-full items-center rounded-md py-2 pl-7 pr-2 text-sm font-medium'}
                                >
                                    {item.name}
                                </a>
                            </div>
                        ) : (
                            <Disclosure as="div" key={item.name} className="space-y-1">
                                {({ open }) => (
                                    <>
                                        <Disclosure.Button
                                            className={clsx(
                                                item.current
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : ' text-gray-300 hover:bg-gray-50 hover:text-gray-900',
                                                'group flex w-full items-center rounded-md py-2 pr-2 text-left text-sm font-medium focus:outline-none focus:ring-2'
                                            )}
                                        >
                                            <svg
                                                className={clsx(
                                                    open ? 'rotate-90 text-gray-400' : 'text-gray-300',
                                                    'mr-2 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400'
                                                )}
                                                viewBox="0 0 20 20"
                                                aria-hidden="true"
                                            >
                                                <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                                            </svg>
                                            {item.name}
                                        </Disclosure.Button>
                                        <Disclosure.Panel className="space-y-1">
                                            {item.children.map((subItem) => (
                                                <Disclosure.Button
                                                    key={subItem.name}
                                                    as="a"
                                                    href={`/${workflowUUID}${subItem.href}`}
                                                    className="group flex w-full items-center rounded-md py-2 pl-10 pr-2 text-sm font-medium text-gray-300 hover:bg-gray-50 hover:text-gray-900"
                                                >
                                                    {subItem.name}
                                                </Disclosure.Button>
                                            ))}
                                        </Disclosure.Panel>
                                    </>
                                )}
                            </Disclosure>
                        )
                    )}
                </nav>
            </div>
        </div>

    );
};

WorkflowNav.propTypes = {

};

export default WorkflowNav;