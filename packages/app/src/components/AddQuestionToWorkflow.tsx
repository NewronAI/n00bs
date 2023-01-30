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

const AddQuestionToWorkflow = () => {

    const router = useRouter();
    const workflowUUID = router.query["workflow-uuid"] as string;

    const {data: questions, error, isLoading, mutate} = useSWR<Prisma.questionSelect[]>(`/api/v1/${workflowUUID}/question`);
    const {data: allQuestions, error: allQuestionsError, isLoading: allQuestionsIsLoading} = useSWR<Prisma.questionSelect[]>(`/api/v1/question`);

    const [addQuestionModalOpen, setAddQuestionModalOpen] = React.useState(false);

    const notAssignedQuestions = useMemo(() => allQuestions?.filter((question) => {
        return !questions?.some((assignedQuestion) => assignedQuestion.uuid === question.uuid);
    }), [questions, allQuestions]);
    const toggleAddQuestionModal = () => setAddQuestionModalOpen(!addQuestionModalOpen);

    const [modifyingQuestion, setModifyingQuestion] = React.useState<boolean>(false);
    const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = React.useState<boolean>(false);
    const [deleteConfirmationModalQuestionUUID, setDeleteConfirmationModalQuestionUUID] = React.useState<string>("");

    const handleDeleteModalOpen = (questionUUID: string) => () => {
        setDeleteConfirmationModalQuestionUUID(questionUUID);
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

        setModifyingQuestion(true);
        try {
            await axios.post(`/api/v1/${workflowUUID}/task/question`, null, {
                params: {
                    "question-uuid": questionUUID
                }
            });
            await mutate();
            toggleAddQuestionModal();
        } catch (e) {
            console.error(e)
        }
        setModifyingQuestion(false);
    }

    const handleDelete = async (e : SyntheticEvent) => {
        e.preventDefault();

        const enteredText = (e.target as HTMLFormElement)["verification-str"]?.value;

        if(!enteredText || enteredText?.toUpperCase() !== "DELETE") {
            return;
        }

        setModifyingQuestion(true);
        try {
            await axios.delete(`/api/v1/${workflowUUID}/task/question`, {
                params: {
                    "question-uuid": deleteConfirmationModalQuestionUUID
                }
            });
            await mutate();
            toggleDeleteConfirmationModal()
        }
        catch (e) {
            console.error(e)
        }
        setModifyingQuestion(false);
    }

    return (
        <div>
            <div className="mt-10 divide-y divide-gray-200">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium leading-6 ">Questions</h3>
                    <p className="max-w-2xl text-sm text-gray-400">
                        Questions are the building blocks of your workflows. You can add questions to your workflows by clicking the "Add Question" button.
                    </p>
                </div>
                {
                    <Loader isLoading={isLoading}>
                        <div className="mt-6">
                            {
                                questions?.map((question) => {
                                    const uuid = question.uuid as unknown as Key;
                                    return (
                                        <dl key={uuid} className="divide-y divide-gray-200">
                                            <div className="py-4 flex justify-between sm:gap-4 sm:py-5">
                                                <dt className="text-sm font-medium text-gray-400">{question.name}</dt>
                                                <dd className="mt-1 flex text-sm  sm:col-span-2 sm:mt-0">
                                                            <span className="flex-grow truncate">
                                                                {
                                                                    question.text
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
                    <button className={"btn w-full btn-primary"} onClick={toggleAddQuestionModal} >
                        Import More Question
                    </button>
                </div>
            </div>
            <Modal open={addQuestionModalOpen} onClose={toggleAddQuestionModal}>
                <form onSubmit={handleAddQuestion}>
                <div className="px-4 pt-2 pb-2 sm:p-2 sm:pb-2">
                    <div className="sm:flex sm:items-start">
                        <div className=" text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium " id="modal-headline">
                                Add Question
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm ">
                                    Select a question to add to your workflow.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <Loader isLoading={allQuestionsIsLoading}>
                    <div className="px-4 py-2 sm:p-2 sm:pb-2">
                        <select className={"w-full select"} name={"question"} required>
                            {
                                notAssignedQuestions?.map((question, i) => {
                                    const uuid = question.uuid as unknown as string as Key;
                                    return (
                                        <option key={uuid} value={uuid} className={"block"}>
                                            <div className={"flex flex-col truncate"}>
                                                <div>
                                                    {question.name}: {question.text}
                                                </div>
                                            </div>
                                        </option>
                                    )
                                })
                            }

                        </select>
                    </div>
                </Loader>

                <div className="btn-group flex justify-end mt-4">

                    <button
                        type="reset"
                        className="btn btn-ghost btn-sm"
                        onClick={toggleAddQuestionModal}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={modifyingQuestion}
                    >
                        {
                            modifyingQuestion ? "Adding..." : "Add question"
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
                                    Are you sure you want to unlink this question from your workflow ?
                                    This can break your workflow if you have already started using it.
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
                        <button className={"btn btn-error btn-sm"} type={"submit"} disabled={modifyingQuestion}>
                            I understand, delete this question
                        </button>
                    </div>
                </div>
                </form>

            </Modal>

        </div>
    );
};

export default AddQuestionToWorkflow;