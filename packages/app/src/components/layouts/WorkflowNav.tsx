import React, { useState } from 'react';
import clsx from "clsx";
import useSWRImmutable from "swr/immutable";
import { Prisma } from "@prisma/client";
import {
    ChartSquareBarIcon,
    CogIcon,
    DocumentDuplicateIcon,
    DocumentIcon,
    DocumentTextIcon,
    UserGroupIcon,
    ViewBoardsIcon
} from "@heroicons/react/outline";

export interface WorkflowNavProps {
    currentPage?: string;
    workflowUUID?: string;

}


const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: <ChartSquareBarIcon className="h-5" aria-hidden="true" />,  },
    { name: 'Files', href: '/all-files', icon: <DocumentDuplicateIcon className="h-5" aria-hidden="true" /> , children : [
        { name: 'All Files', href: '/unassigned', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
        { name: 'Unassigned Files', href: '/unassigned', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
        { name: 'Assigned Files', href: '/assigned', icon: <DocumentIcon className="h-5" aria-hidden="true" /> },
    ]},
    { name: 'Jobs', href: '/jobs', icon: <ViewBoardsIcon className="h-5" aria-hidden="true" /> },
    // { name: 'Open Jobs', href: '/jobs' },
    // { name: 'Completed Jobs', href: '/completed-jobs' },
    { name: 'Workers', href: '/workers', icon: <UserGroupIcon className="h-5" aria-hidden="true" /> },
    { name: 'Settings', href: '/settings', icon: <CogIcon className="h-5" aria-hidden="true" /> },
];

const WorkflowNav = (props: WorkflowNavProps) => {

    const { currentPage, workflowUUID } = props;
    const [isOpen, setIsOpen] = useState(false)

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
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-500 pt-5 pb-4 w-1/6">
            <div className="mt-5 flex flex-grow flex-col">
                <nav className="flex-1 space-y-1 px-2" aria-label="Sidebar">
                    <div>
                        <a href="#" className="bg-gray-100 text-gray-900 group flex w-full items-center rounded-md py-2 pl-7 pr-2 text-sm font-medium">{workflow?.name}</a>
                    </div>
                    {navigation.map((item) => (
                        <div className="space-y-1" key={item.name} >

                            <button type="button" className=" text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex w-full items-center rounded-md py-2 pr-2 text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-controls="sub-menu-1" aria-expanded="false">
                                {/* <!-- Expanded: "rotate-90 text-gray-400", Collapsed: "text-gray-300" --> */}
                                <svg className="text-gray-300 mr-2 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400" viewBox="0 0 20 20" aria-hidden="true">
                                    <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                                </svg>
                                <a href={`/${workflowUUID}${item.href}`}>{item.name}</a>
                            </button>

                            {/* <!-- Expandable link section, show/hide based on state. --> */}
                            
                            {isOpen ? <div className="space-y-1" id="sub-menu-1">
                                <a href="#" className="group flex w-full items-center rounded-md py-2 pl-10 pr-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">Overview</a>
                            </div>:''}
                        </div>
                    ))}
                </nav>
            </div>

        </div>

    );
};

WorkflowNav.propTypes = {

};

export default WorkflowNav;