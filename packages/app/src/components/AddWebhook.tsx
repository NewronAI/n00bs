import React, {Key, SyntheticEvent} from 'react';
import useSWR from "swr";
import Loader from "@/components/Loader";
import {events, Prisma} from "@prisma/client";
import Modal from "@/components/Modal";
import axios from "axios";
import _ from "lodash";

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

    const handleAddWebhook = async (e : React.SyntheticEvent) => {
        e.preventDefault();

        const target = e.target as typeof e.target & {
            name: { value: string };
            url: { value: string };
            method: { value: string };
            event: { value: string };
            secret: { value: string };
        };

        const name = target.name.value;
        const url = target.url.value;
        const method = target.method.value;
        const event = target.event.value;
        const secret = target.secret.value;


        setModifyingWebhook(true);
        try {
            await axios.post(`/api/v1/${workflowUUID}/webhook`, {
                name,
                url,
                method,
                event,
                secret
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
            await axios.delete(`/api/v1/${workflowUUID}/webhook`, {
                params: {
                    "webhook-uuid": deleteConfirmationModalWebhookUUID
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
            <div className="mt-10">
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
                                        <dl key={uuid} className="">
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
                <form onSubmit={handleAddWebhook}>
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

                    <div className={"flex flex-col gap-2 px-5 mt-4"}>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium ">
                                Webhook Name*
                            </label>
                            <div className="mt-1">
                                <input className={"input w-full"} type="text" name="name" id="name" required/>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="url" className="block text-sm font-medium ">
                                Webhook URL*
                            </label>
                            <div className="mt-1">
                                <input className={"input w-full"} type="text" name="url" id="url" required/>
                            </div>
                        </div>

                       <div className={"flex w-full gap-2"}>
                            <div className={"w-1/2"}>
                                <label htmlFor="method" className="block text-sm font-medium ">
                                    Method*
                                </label>
                                <div className="mt-1">
                                    <select className={"select w-full"} name="method" id="method" required>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                    </select>
                                </div>
                            </div>
                            <div className={"w-1/2"}>
                                <label htmlFor="event" className="block text-sm font-medium ">
                                    Event*
                                </label>
                                <div className="mt-1">
                                    <select className={"select w-full"} name="event" id="event" required>
                                        {
                                            Object.keys(events).map((event) => {
                                                let event_name = event.split("_").join(" ");
                                                return <option key={event} value={event}>{_.capitalize(event_name)}</option>
                                            })
                                        }
                                    </select>
                                    <div>
                                        <p className="text-xs text-warning px-4 mt-2">
                                            Note: Not all events are implemented yet.
                                        </p>
                                    </div>
                                </div>
                            </div>
                       </div>

                        <div>
                            <label htmlFor="secret" className="block text-sm font-medium ">
                                Secret (optional, will be sent in the header)
                            </label>
                            <div className="mt-1">
                                <input className={"input w-full"} type="text" name="secret" id="secret"/>
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