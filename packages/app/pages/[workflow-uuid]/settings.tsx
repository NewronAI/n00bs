import React from 'react'
import clsx from "clsx";
import WorkflowNav from "@/components/layouts/WorkflowNav";
import Head from "next/head";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {useRouter} from "next/router";
import ProfileSettingsTab from "@/components/ProfileSettingsTab";
import AddQuestionToWorkflow from "@/components/AddQuestionToWorkflow";
import IngestFilesDoc from "@/components/IngestFilesDoc";
import AddWebhook from "@/components/AddWebhook";

const tabs = [
    {id: "profile", name: 'Profile'},
    {id: "questions" ,name: 'Questions', },
    {id: "webhooks", name: 'Webhooks'},
    {id: "files", name: 'Files'},
]
const SettingsPage = () => {

    const router = useRouter();
    const [selectedTab, setSelectedTab] = React.useState(tabs[0].id)
    const workflowUUID = router.query["workflow-uuid"] as string;


    // @ts-ignore
    return (
        <DashboardLayout currentPage={""} secondaryNav={<WorkflowNav currentPage={"settings"} workflowUUID={workflowUUID} />} >
            <Head>
                <title>Settings & Docs</title>
            </Head>
            <main className="flex-1">
                <div className="relative mx-auto max-w-6xl md:px-8 xl:px-0">
                    <div className="pt-10 pb-16">
                        <div className="px-4 sm:px-6 md:px-0">
                            <h1 className="text-3xl font-bold tracking-tight ">Settings & Docs</h1>
                        </div>
                        <div className="px-4 sm:px-6 md:px-0">
                            <div className="py-6">
                                {/* Tabs */}
                                <div className="lg:hidden">
                                    <label htmlFor="selected-tab" className="sr-only">
                                        Select a tab
                                    </label>
                                    <select
                                        id="selected-tab"
                                        name="selected-tab"
                                        onChange={(e) => setSelectedTab(e.target.value)}
                                        className="select w-full text-xl pl-2 -ml-3"
                                        defaultValue={tabs[0].id}
                                    >
                                        {tabs.map((tab) => (
                                            <option key={tab.name} value={tab.id}>{tab.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="hidden lg:block">
                                    <div className="border-b border-gray-200">
                                        <nav className="-mb-px flex space-x-8">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab.name}
                                                    onClick={() => setSelectedTab(tab.id)}
                                                    className={clsx(
                                                        selectedTab === tab.id
                                                            ? 'border-purple-500 text-purple-600'
                                                            : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-700',
                                                        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                                                    )}
                                                >
                                                    {tab.name}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>
                                </div>

                                {/* Description list with inline editing */}
                                {
                                    (() => {

                                        switch (selectedTab) {
                                            case "questions":
                                                return <AddQuestionToWorkflow />
                                            case "profile":
                                                return <ProfileSettingsTab />
                                            case "files":
                                                return <IngestFilesDoc workflowUUID={workflowUUID} />
                                            case "webhooks":
                                                return <AddWebhook workflowUUID={workflowUUID} />
                                        }

                                    })()
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </DashboardLayout>
    );
};

export default SettingsPage;