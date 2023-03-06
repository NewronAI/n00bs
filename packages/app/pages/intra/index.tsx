import {
    UsersIcon, PlusCircleIcon, ViewListIcon, CogIcon,
} from '@heroicons/react/outline'
import DashboardLayout from "@/components/layouts/DashboardLayout";
import clsx from "clsx";
import React from "react";

const actions = [
    {
        title: 'Create new Intra Pair task',
        href: '/intra/create_new',
        icon: PlusCircleIcon,
        description: 'Create a new Intra Pair task by uploading a CSV file.',
        iconForeground: 'text-teal-700',
        iconBackground: 'bg-teal-50',
    },
    {
        title: 'View All Tasks',
        href: '/intra/intra-tasks',
        icon: ViewListIcon,
        description: 'View all the tasks which and see who is assigned to the job.',
        iconForeground: 'text-purple-700',
        iconBackground: 'bg-purple-50',
    },
    // {
    //     title: 'Performance Metrics',
    //     href: '/intra/metrics',
    //     icon: UsersIcon,
    //     description: 'View the performance metrics of the tasks which are completed.',
    //     iconForeground: 'text-sky-700',
    //     iconBackground: 'bg-sky-50',
    // },
    // {
    //     title: "Settings",
    //     href: '/intra/settings',
    //     icon: CogIcon,
    //     description: 'View and update the settings of the Intra Pair task.',
    //     iconForeground: 'text-amber-700',
    //     iconBackground: 'bg-amber-50',
    // }
]



export default function Example() {
    return (
        <DashboardLayout currentPage={"intra check"} secondaryNav={<></>}>

            <div className={"p-0 md:pl-4"}>
                <h1 className={"text-2xl font-bold"}>
                    Intra check
                </h1>
                <p className={"font-thin text-sm"}>
                    Perform a check on the pair files which are from same speaker.
                </p>
            </div>

            <div className="divide-y divide-gray-200 overflow-hidden rounded-lg  shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
                {actions.map((action, actionIdx) => (
                    <div
                        key={action.title}
                        className={clsx(
                            actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
                            actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
                            actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
                            actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
                            'relative group  p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 bg-zinc-700 hover:bg-zinc-900 bg-opacity-5'
                        )}
                    >
                        <div>
            <span
                className={clsx(
                    action.iconBackground,
                    action.iconForeground,
                    'rounded-lg inline-flex p-3 ring-4 ring-white'
                )}
            >
              <action.icon className="h-6 w-6" aria-hidden="true" />
            </span>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-base font-semibold leading-6 ">
                                <a href={action.href} className="focus:outline-none">
                                    {/* Extend touch target to entire panel */}
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    {action.title}
                                </a>
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {action.description}
                            </p>
                        </div>
                        <span
                            className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                            aria-hidden="true"
                        >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}
