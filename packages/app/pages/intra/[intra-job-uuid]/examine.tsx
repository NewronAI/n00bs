import React from 'react';
import PropTypes from 'prop-types';
import clsx from "clsx";
import {PlayIcon} from "@heroicons/react/solid";

const sampleAudios = [
    {
        name: 'Reference Audio 1',
        href: '#',
        members: '3',
        bgColor: 'bg-indigo-500',
        initials: 'SA',
    },
    {
        name: 'Reference Audio 2',
        href: '#',
        members: '3',
        bgColor: 'bg-indigo-500',
        initials: 'SA',
    },
];

const Examine = (props: any) => {
    return (
        <div className={"flex justify-center items-center py-4"}>
            <div className="max-w-md">
                <div>
                    <div>
                        <h2 className="text-lg font-bold">Sample Audios</h2>
                    </div>
                    <ul role="list" className="mt-3 grid gap-3 grid-cols-2">
                        {sampleAudios.map((sampleAudio) => (
                            <li key={sampleAudio.name} className="col-span-1 flex rounded-md shadow-sm">
                                <div
                                    className={clsx(
                                        sampleAudio.bgColor,
                                        'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
                                    )}
                                >
                                    <PlayIcon className={"h-12 py-2"}/>
                                </div>
                                <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
                                    <div className="flex-1 truncate px-4 py-2 text-sm">
                                        <a href={sampleAudio.href} className="font-medium text-gray-900 hover:text-gray-600">
                                            {sampleAudio.name}
                                        </a>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <div>
                        <h2 className="text-lg font-bold py-4">Subject Audio</h2>
                    </div>
                    <li className="col-span-1 flex rounded-md shadow-sm">
                        <div
                            className={clsx(
                                "bg-red-600",
                                'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
                            )}
                        >
                            <PlayIcon className={"h-12 py-2"}/>
                        </div>
                        <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
                            <div className="flex-1 truncate px-4 py-2 text-sm">
                                <a href={"#"} className="font-medium text-gray-900 hover:text-gray-600">
                                    Subject Audio
                                </a>
                            </div>
                        </div>
                    </li>
                </div>

                <div>
                    <h2 className={"text-lg py-4"}>
                        <span className={"font-bold"}>Questions</span>
                    </h2>
                    <div>
                        <div className={""}>
                            Are the two audios of the same person?
                        </div>
                        <div className={"flex items-center justify-end mt-3"}>
                            <div className={"btn-group "}>
                                <button className={"btn btn-sm btn-primary"}>Yes</button>
                                <button className={"btn btn-sm btn-secondary"}>No</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className={""}>
                            How confident are you in your answer?
                        </div>
                        <div className={"flex items-center justify-end mt-3"}>
                            <div className={"flex gap-4"}>
                                <fieldset className={""}>
                                    <input type="radio" name={"confidence"} value={"less"} id={"lessC"}/>
                                    <label htmlFor={"lessC"} className={"ml-2 text-error"}>Less Confident</label>
                                </fieldset>
                                <fieldset>
                                    <input type="radio" name={"confidence"} value={"somewhat"} id={"somewhatC"}/>
                                    <label htmlFor={"somewhatC"} className={"ml-2 text-secondary"}>Confident</label>
                                </fieldset>
                                <fieldset>
                                    <input type="radio" name={"confidence"} value={"very"} id={"veryC"}/>
                                    <label htmlFor={"veryC"} className={"ml-2 text-primary"}>Very Confident</label>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className={"mt-6"}>
                        <button className={"btn btn-primary w-full"}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

Examine.propTypes = {

};

export default Examine;