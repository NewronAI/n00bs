import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from "clsx";
import {PlusIcon} from "@heroicons/react/outline";
import {TrashIcon} from "@heroicons/react/solid";
import {question_type} from "@prisma/client";

interface CreateUpdateQuestionProps {
    title: string;
    description: string;


}

type QuestionTypeMapType = {
    [key: string]: string;
}

const questionTypesMap : QuestionTypeMapType = {
    [question_type.boolean] : "Yes/No",
    [question_type.radio] : "Radio",
    [question_type.checkbox] : "Checkbox",
    [question_type.text] : "Text",
}

const CreateUpdateQuestion = ({}) => {

    const [createQuestionCollapse, setCreateQuestionCollapse] = useState(false);

    const [options, setOptions] = useState<string[]>([]);

    const [questionType, setQuestionType] = useState<string>(question_type.boolean);

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

    useEffect(() => {
        changeQuestionType(question_type.boolean);
    }, [])

    return (
        <div>
            <div>
                <div tabIndex={0}
                     className={clsx("mt-4 mx-4 collapse collapse-arrow border border-base-300 bg-base-100 rounded-box", {"collapse-open" : createQuestionCollapse, "collapse-close": !createQuestionCollapse})}>
                    <div onClick={() => setCreateQuestionCollapse(!createQuestionCollapse)}
                         className="collapse-title bg-neutral">
                        <div className={"flex"}> <PlusIcon className={"w-5 h-5 mr-2"} /> Create New Question </div>
                    </div>
                    <div className={clsx("border border-neutral p-4 rounded-b-2xl",{"hidden": !createQuestionCollapse})}>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Question</span>
                            </label>
                            <input type="text" placeholder="Question" className="input input-bordered" />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Description</span>
                            </label>
                            <textarea className="textarea h-24 textarea-bordered" placeholder="Description"></textarea>
                        </div>

                        <div className={"flex gap-4"}>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Type</span>
                                </label>
                                <select className="select select-bordered w-full max-w-xs"
                                        value={questionType}
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
                                <input type="text" placeholder="Order" className="input input-bordered" />
                            </div>

                            <div className="flex items-center mt-8">
                                <label className="label">
                                    <span className="label-text">Required</span>
                                </label>
                                <input type="checkbox" className="toggle toggle-primary" />
                            </div>

                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Question text</span>
                            </label>
                            <textarea className="textarea h-24 textarea-bordered" placeholder="Eg: Is the audio audible?"></textarea>
                        </div>


                        {
                            questionType !== question_type.text &&
                            <div className="form-control">
                            <label className="label">
                                <span className="label-text">Options</span>
                            </label>
                            <div className={"flex gap-4"}>
                                {
                                    options.map((option, index) => {
                                        return (
                                            <div className={"flex gap-4"}>
                                                <input type="text"
                                                       placeholder="Option"
                                                       className="input w-48 input-sm input-bordered"
                                                       value={option}
                                                       onChange={(e) => {
                                                           const newOptions = [...options];
                                                           newOptions[index] = e.target.value;
                                                           setOptions(newOptions);
                                                       }}
                                                />
                                                <button onClick={() => removeOption(index)}
                                                        className={"btn btn-sm btn-error"}>
                                                    <span className={"sr-only"}>Remove</span> <TrashIcon
                                                    className={"w-5 h-5"}/>
                                                </button>
                                            </div>)
                                    })
                                }
                                <button onClick={() => addOption("")} className={"btn btn-sm btn-primary"}>
                                    <span className={"sr-only"}>Add</span> <PlusIcon className={"w-5 h-5"}/>
                                </button>
                            </div>
                        </div>}

                        <div className={"flex justify-end mt-4"}>
                            <button className={"btn btn-primary w-64"}>Create</button>
                        </div>


                    </div>
                </div>

            </div>
        </div>
    );
};

CreateUpdateQuestion.propTypes = {

};

export default CreateUpdateQuestion;