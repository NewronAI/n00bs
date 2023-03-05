import React, {useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import clsx from "clsx";
import {PlayIcon} from "@heroicons/react/solid";
import {useRouter} from "next/router";
import useSWR from "swr";
import Link from "next/link";
import Head from "next/head";

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

    const router = useRouter();
    const intraJobUuid = router.query["intra-job-uuid"];

    const {data, error, isLoading} = useSWR(`/api/v1/intra/${intraJobUuid}/job`);

    const referenceAudioTagRefs = useRef<HTMLAudioElement[]>([]);
    const subjectAudioTagRef = useRef<HTMLAudioElement>(null);

    const files = data?.intra_pair_files || [];
    const assignedTo = data?.assigned_to || [];
    const createdBy = data?.created_by || [];
    const groupSize = data?.group_size || 0;

    const referenceAudios = useMemo(() => {
        return files.filter((file: any) => file.is_reference);
    },[files]);

    const subjectAudios = useMemo(() => {
        return files.filter((file: any) => !file.is_reference);
    }, [files]);

    const playReferenceAudio = (index: number) => () => {

        referenceAudioTagRefs.current.forEach((audioTagRef) => {
            audioTagRef.pause();
        });

        subjectAudioTagRef.current?.pause();

        referenceAudioTagRefs.current[index].play().then(() => {
            console.log("played");
        }).catch(console.error);

    }


    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    return (
        <div className={"flex justify-center items-center py-4"}>
            <Head>
                <title>
                    Intra Job :
                    {
                        data.name
                    }
                </title>
            </Head>
            <div className="max-w-md">
                <div>
                    <div>
                        <h2 className="text-lg font-bold">Sample Audios</h2>
                    </div>
                    <ul role="list" className="mt-3 flex gap-3 flex-wrap ">
                        {referenceAudios.map((referenceAudio: any, i : number) => (
                            <li key={referenceAudio.name} className="grow-1 flex-1 flex rounded-md shadow-sm max-w-md">
                                <div
                                    className={clsx(
                                        "bg-indigo-700",
                                        'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
                                    )}
                                >
                                    <button onClick={playReferenceAudio(i)}>
                                        <PlayIcon className={"h-12 py-2"}/>
                                    </button>
                                </div>
                                <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
                                    <div className="flex-1 truncate px-4 py-2 text-sm">
                                        <Link target={'__blank'} href={referenceAudio.file} className="font-medium text-gray-900 hover:text-gray-600 truncate">
                                            {referenceAudio.file_name}
                                        </Link>
                                    </div>
                                    <audio src={referenceAudio.file} ref={(r) => {
                                        // @ts-ignore
                                        referenceAudioTagRefs.current.splice(i, 1, r);
                                    }} ></audio>
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
                                <Link target={"__blank"} href={subjectAudios[0].file} className="font-medium text-gray-900 hover:text-gray-600">
                                    {
                                        subjectAudios[0].file_name
                                    }
                                </Link>
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
                        <div className={"flex items-center  mt-3"}>
                            <div className={"flex gap-4"}>
                                <fieldset>
                                    <input type="radio" name={"confidence"} value={"very"} id={"veryC"}/>
                                    <label htmlFor={"veryC"} className={"ml-2 text-primary"}>Yes</label>
                                </fieldset>
                                <fieldset>
                                    <input type="radio" name={"confidence"} value={"somewhat"} id={"somewhatC"}/>
                                    <label htmlFor={"somewhatC"} className={"ml-2 text-secondary"}>No</label>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className={"mt-4"}>
                            How confident are you in your answer?
                        </div>
                        <div className={"flex items-center mt-3"}>
                            <div className={"flex gap-4"}>
                                <fieldset>
                                    <input type="radio" name={"confidence"} value={"very"} id={"veryC"}/>
                                    <label htmlFor={"veryC"} className={"ml-2 text-primary"}>Very Confident</label>
                                </fieldset>
                                <fieldset>
                                    <input type="radio" name={"confidence"} value={"somewhat"} id={"somewhatC"}/>
                                    <label htmlFor={"somewhatC"} className={"ml-2 text-secondary"}>Confident</label>
                                </fieldset>
                                <fieldset className={""}>
                                    <input type="radio" name={"confidence"} value={"less"} id={"lessC"}/>
                                    <label htmlFor={"lessC"} className={"ml-2 text-error"}>Less Confident</label>
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