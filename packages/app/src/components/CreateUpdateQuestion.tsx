import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from "clsx";
import {PencilIcon, PlusIcon} from "@heroicons/react/outline";
import {TrashIcon} from "@heroicons/react/solid";
import {obj_status, question_type} from "@prisma/client";
import QuestionItem from "@/interfaces/QuestionItem";
import axios from "axios";

type QuestionTypeMapType = {
    [key: string]: string;
}

const questionTypesMap : QuestionTypeMapType = {
    [question_type.boolean] : "Yes/No",
    [question_type.radio] : "Radio",
    [question_type.checkbox] : "Checkbox",
    [question_type.text] : "Text",
}


export interface CreateUpdateQuestionProps {
    question?: QuestionItem;
    mutate?: any;
    questionNumber?: number;

}

const CreateUpdateQuestion = (props? : CreateUpdateQuestionProps) => {

    // const question : QuestionItem | undefined = props?.question || undefined;
    const [question, setQuestion] = useState<QuestionItem | undefined>(props?.question || undefined);

    const mutate = props?.mutate || undefined;
    const questionNumber : number | undefined = props?.questionNumber;

    const [createQuestionCollapse, setCreateQuestionCollapse] = useState(false);

    const [options, setOptions] = useState<string[]>([]);

    const [questionType, setQuestionType] = useState<string>(question_type.boolean);

    const [editMode, setEditMode] = useState<boolean>(!question);

    const addOption = (option : string) => {
        setOptions([...options, option]);
    }

    const removeOption = (index : number) => {
        setOptions(options.filter((_, i) => i !== index));
    }

    const changeQuestionType = (type : string) => {
        switch (type) {
            case question_type.text:
                setOptions([]);
                break;
            case question_type.radio:
                setOptions(["Option 1", "Option 2", "Option 3"]);
                break;
            case question_type.checkbox:
                setOptions(["Option 1", "Option 2"]);
                break;
            case question_type.boolean:
                setOptions(["Yes", "No"]);
                break;
        }
        setQuestionType(type);
    }

    const cancelEdit = () => {
        setQuestion(props?.question || undefined);
        setEditMode(!question);
        setCreateQuestionCollapse(false);
    }

    const submitQuestionForm = async (e : any) => {
        e.preventDefault();
        const questionName = e.target.questionName.value;
        const questionText = e.target.questionText.value;
        const questionType = e.target.questionType.value;
        const questionOptions = options;
        const questionRequired = e.target.questionRequired.checked;
        const questionOrder = e.target.questionOrder.value;

        const questionData : QuestionItem = {
            name: questionName,
            text: questionText,
            question_type: questionType,
            options: questionOptions,
            // status: obj_status.active,
            required: questionRequired,
            order: questionOrder,
        }

        if (question) {
            // Update question
        } else {
            // Create question
            await axios.post("/api/v1/question", questionData);
            mutate?.();
            e.target.reset();
            setCreateQuestionCollapse(false);
        }
    }

    useEffect(() => {
        if (question) {
            setOptions(question.options);
            setQuestionType(question.question_type);
        }
        else {
            changeQuestionType(question_type.boolean);
        }
    }, [])

    return (
        <div>
            <form onSubmit={submitQuestionForm}>
                <div tabIndex={0}
                     className={clsx("mt-4 mx-4 collapse collapse-arrow border  bg-base-100 rounded-box",
                         {"collapse-open" : createQuestionCollapse, "collapse-close": !createQuestionCollapse},
                         {"border-neutral": !!question, "border-primary": !question}
                     )}>
                    <div onClick={() => setCreateQuestionCollapse(!createQuestionCollapse)}
                         className={clsx("collapse-title ", {"bg-neutral": !!question, "bg-primary text-white": !question},)}>
                        <h3 className={"flex"}>
                            { questionNumber ? <span className={"text-xl mr-3"}> {questionNumber}. </span>:<PlusIcon className={"w-5 h-5 mr-2"}/>}
                            { question?.name || "Create New Question"}
                        </h3>
                        <p className={"text-sm truncate"}>{question?.text}</p>
                    </div>
                    <div className={clsx("border border-neutral p-4 rounded-b-2xl",{"hidden": !createQuestionCollapse})}>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Question Name</span>
                            </label>
                            <input name={"questionName"} type="text" placeholder="Question"
                                   className="input input-bordered"
                                   defaultValue={question?.name}
                                   readOnly={!editMode}
                                  required
                            />
                        </div>

                        <div className={"flex gap-4"}>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Type</span>
                                </label>
                                <select name={"questionType"}
                                        className="select select-bordered w-full max-w-xs"
                                        value={questionType}
                                        disabled={!editMode}
                                        onChange={e => changeQuestionType(e.target.value as string)}>
                                    {Object.keys(questionTypesMap).map((key) => {
                                        return <option key={key} value={key}>{questionTypesMap[key]} </option>
                                    })}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Order</span>
                                </label>
                                <input type="number" name={"questionOrder"}
                                       placeholder="Order"
                                       className="input input-bordered"
                                        defaultValue={question?.order}
                                       readOnly={!editMode}
                                />
                            </div>

                            <div className="flex items-center mt-8">
                                <label className="label">
                                    <span className="label-text">Required</span>
                                </label>
                                <input type="checkbox" name={"questionRequired"}
                                       className="toggle toggle-primary"
                                        defaultChecked={question?.required}
                                       disabled={!editMode}
                                />
                            </div>

                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Question text</span>
                            </label>
                            <textarea className="textarea h-24 textarea-bordered"
                                      placeholder="Eg: Is the audio audible?"
                                      name={"questionText"}
                                      readOnly={!editMode}
                                    defaultValue={question?.text}
                                      required
                            />
                        </div>


                        {
                            questionType !== question_type.text &&
                            <div className="form-control">
                            <label className="label">
                                <span className="label-text">Options</span>
                            </label>
                            <div className={"flex gap-4 flex-wrap"}>
                                {
                                    options.map((option, index) => {
                                        return (
                                            <div key={index} className={"flex gap-4"}>
                                                <input type="text"
                                                       placeholder="Option"
                                                       className="input w-48 input-sm input-bordered"
                                                       value={option}
                                                       required
                                                       readOnly={!editMode}
                                                       onChange={(e) => {
                                                           const newOptions = [...options];
                                                           newOptions[index] = e.target.value;
                                                           setOptions(newOptions);
                                                       }}
                                                />
                                                {
                                                    editMode &&
                                                    <button onClick={() => removeOption(index)}
                                                         className={"btn btn-sm btn-error"}>
                                                    <span className={"sr-only"}>Remove</span> <TrashIcon
                                                    className={"w-5 h-5"}/>
                                                    </button>
                                                }
                                            </div>)
                                    })
                                }
                                {
                                    editMode &&
                                    <button onClick={() => addOption("")} className={"btn btn-sm btn-primary"}>
                                        <span className={"sr-only"}>Add</span> <PlusIcon className={"w-5 h-5"}/>
                                    </button>
                                }
                            </div>
                        </div>}

                        <div className={"flex justify-end mt-4"}>
                            {
                                editMode ?
                                    <>
                                        <button onClick={cancelEdit} className={"w-32"}>
                                            Cancel
                                        </button>
                                        <button className={"btn btn-primary w-64"}>
                                            {!!question ? "Save changes" : "Create"}
                                        </button>
                                    </>
                                        :
                                    <>
                                        <button onClick={() => setEditMode(true)} className={"btn btn-secondary w-64"}>
                                            Edit Question <PencilIcon className={" ml-2 h-4 w-4"} />
                                        </button>
                                    </>
                            }
                        </div>


                    </div>
                </div>

            </form>
        </div>
    );
};

CreateUpdateQuestion.propTypes = {

};

export default CreateUpdateQuestion;