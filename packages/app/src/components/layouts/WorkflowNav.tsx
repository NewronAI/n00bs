import React from 'react';
import PropTypes from 'prop-types';
import clsx from "clsx";

export interface WorkflowNavProps {
    currentPage?: string;
    workflowUUID?: string;

}


const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'All Files', href: '/all-files' },
    { name: 'Unassigned Files', href: '/unassigned'  },
    { name: 'Assigned Files', href: '/assigned' },
    { name: 'Jobs', href: '/jobs' },
    // { name: 'Open Jobs', href: '/jobs' },
    // { name: 'Completed Jobs', href: '/completed-jobs' },
    { name: 'Workers', href: '/workers'},
    { name: 'Settings', href: '/settings'},
];

const WorkflowNav = (props : WorkflowNavProps) => {

    const { currentPage, workflowUUID } = props;

    return (
        <div className="hidden sm:flex sm:space-x-8">
            {navigation.map((item) => (
                <a
                    key={item.name}
                    href={`/${workflowUUID}${item.href}`}
                    className={clsx(
                        item.name.toLowerCase() === currentPage
                            ? 'border-indigo-500 text-zinc-500 dark:text-zinc-100'
                            : 'border-transparent text-zinc-300 dark:text-zinc-200 hover:border-gray-300 hover:text-zinc-700',
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-thin'
                    )}
                    aria-current={item.name === currentPage ? 'page' : undefined}
                >
                    {item.name}
                </a>
            ))}
        </div>
    );
};

WorkflowNav.propTypes = {

};

export default WorkflowNav;