import PropTypes from 'prop-types';
import React, {Key, SyntheticEvent, useMemo} from 'react';
import clsx from "clsx";
import ProfileSettingsTab from "@/components/ProfileSettingsTab";
import Avatar from "@/components/Avatar";
import useSWR from "swr";
import {useRouter} from "next/router";
import Loader from "@/components/Loader";
import {Prisma} from "@prisma/client";
import Modal from "@/components/Modal";
import axios from "axios";

type AddWebhookProps = {
    workflowUUID: string
}
const AddWebhook = ( props : AddWebhookProps ) => {

    const {workflowUUID} = props;

    const {data: webhooks, error, isLoading, mutate} = useSWR<Prisma.webhookSelect[]>(`/api/v1/${workflowUUID}/webhook`);

    const [addWebhookModalOpen, setAddWebhookModalOpen] = React.useState(false);

    const toggleAddWebhookModal = () => setAddWebhookModalOpen(!addWebhookModalOpen);

    const [modifyingWebhook, setModifyingWebhook] = React.useState<boolean>(false);
    const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = React.useState<boolean>(false);
    const [deleteConfirmationModalWebhookUUID, setDeleteConfirmationModalWebhookUUID] = React.useState<string>("");

    const handleDeleteModalOpen = (questionUUID: string) => () => {
        setDeleteConfirmationModalWebhookUUID(questionUUID);
        toggleDeleteConfirmationModal();
    }

    const toggleDeleteConfirmationModal = () => setDeleteConfirmationModalOpen(!deleteConfirmationModalOpen);

    const handleAddQuestion = async (e : React.SyntheticEvent) => {
        e.preventDefault();
        console.log("Adding question to workflow")
        const questionUUID = (e.target as HTMLFormElement)["question"]?.value;

        if(!questionUUID) {
            console.log("No question selected");
            return;
        }

        setModifyingWebhook(true);
        try {
            await axios.post(`/api/v1/${workflowUUID}/task/question`, null, {
                params: {
                    "question-uuid": questionUUID
                }
            });
            await mutate();
            toggleAddWebhookModal();
        } catch (e) {
            console.error(e)
        }
        setModifyingWebhook(false);
    }

    const handleDelete = async (e : SyntheticEvent) => {
        e.preventDefault();

        const enteredText = (e.target as HTMLFormElement)["verification-str"]?.value;

        if(!enteredText || enteredText?.toUpperCase() !== "DELETE") {
            return;
        }

        setModifyingWebhook(true);
        try {
            await axios.delete(`/api/v1/${workflowUUID}/task/question`, {
                params: {
                    "question-uuid": deleteConfirmationModalWebhookUUID
                }
            });
            await mutate();
            toggleDeleteConfirmationModal()
        }
        catch (e) {
            console.error(e)
        }
        setModifyingWebhook(false);
    }

    return (
        <div>
            <div className="mt-10 divide-y divide-gray-200">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium leading-6 ">Webhooks</h3>
                    <p className="max-w-2xl text-sm text-gray-400">
                        Webhooks allow you to integrate your workflow with other services. You can add a webhook to your workflow to send a notification to a service when a task is completed.
                    </p>
                </div>
                {
                    <Loader isLoading={isLoading} error={error} >
                        <div className="mt-6">
                            {
                                webhooks?.map((webhook) => {
                                    const uuid = webhook.uuid as unknown as Key;
                                    return (
                                        <dl key={uuid} className="divide-y divide-gray-200">
                                            <div className="py-4 flex justify-between sm:gap-4 sm:py-5">
                                                <dt className="text-sm font-medium text-gray-400">{webhook.name}</dt>
                                                <dd className="mt-1 flex text-sm  sm:col-span-2 sm:mt-0">
                                                            <span className="flex-grow truncate">
                                                                {
                                                                    webhook.url
                                                                }
                                                            </span>
                                                </dd>
                                                <dd>
                                                    <span className="ml-4 flex-shrink-0">
                                                      <button
                                                          type="button"
                                                          className="btn btn-error btn-sm"
                                                          onClick={handleDeleteModalOpen(uuid as string)}
                                                      >
                                                          Delete
                                                        </button>
                                                    </span>
                                                </dd>
                                            </div>
                                        </dl> )
                                })
                            }
                        </div>
                    </Loader>
                }
            </div>



            <div className="mt-10 divide-y divide-gray-200">
                <div className="space-y-1">
                    <button className={"btn w-full btn-secondary"} onClick={toggleAddWebhookModal} >
                        Add webhook
                    </button>
                </div>
            </div>
            <Modal open={addWebhookModalOpen} onClose={toggleAddWebhookModal}>
                <form onSubmit={handleAddQuestion}>
                    <div className="px-4 pt-2 pb-2 sm:p-2 sm:pb-2">
                        <div className="sm:flex sm:items-start">
                            <div className=" text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium " id="modal-headline">
                                    Add webhook
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm ">
                                        Workflows can be integrated with other services using webhooks. You can add a webhook to your workflow to send a notification to a service when a task is completed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="btn-group flex justify-end mt-4">

                        <button
                            type="reset"
                            className="btn btn-ghost btn-sm"
                            onClick={toggleAddWebhookModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={modifyingWebhook}
                        >
                            {
                                modifyingWebhook ? "Adding..." : "Add webhook"
                            }
                        </button>
                    </div>
                </form>
            </Modal>

            {/*    Delete confirmation model*/}

            <Modal open={deleteConfirmationModalOpen} onClose={toggleDeleteConfirmationModal}>
                <form onSubmit={handleDelete}>
                    <div className="px-4 pt-2 pb-2 sm:p-2 sm:pb-2">
                        <div className="sm:flex sm:items-start">
                            <div className=" text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium " id="modal-headline">
                                    Delete Question
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm ">
                                        Are you sure you want to delete this webhook? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-2 sm:p-2 sm:pb-2">
                            <label htmlFor={"verification-str"} autoCorrect={"none"}  className={"label"}>Type &apos;delete&apos; to confirm </label>
                            <input className={"input input-bordered w-full"} name={"verification-str"} required />
                        </div>
                        <div className={"btn-group flex justify-end mt-4"}>
                            <button className={"btn btn-ghost btn-sm"} type={"reset"} onClick={toggleDeleteConfirmationModal}>
                                Cancel
                            </button>
                            <button className={"btn btn-error btn-sm"} type={"submit"} disabled={modifyingWebhook}>
                                I understand, delete this webhook
                            </button>
                        </div>
                    </div>
                </form>

            </Modal>

        </div>
    );
};

export default AddWebhook;