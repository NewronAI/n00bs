import React, {useEffect, useMemo, useRef} from 'react';
import clsx from "clsx";
import {PlayIcon} from "@heroicons/react/solid";
import {useRouter} from "next/router";
import useSWR from "swr";
import Link from "next/link";
import Head from "next/head";
import intraFileLogic, {calculateCosineThreshold, isThresholdFound} from "@/helpers/react/intraFileLogic";
import axios from "axios";
import {toast} from "react-toastify";
import Loader from "@/components/Loader";


const Examine = () => {

    const router = useRouter();
    const intraJobUuid = router.query["intra-job-uuid"];

    const {data, error, isLoading, mutate} = useSWR(`/api/v1/intra/${intraJobUuid}/job`);

    const referenceAudioTagRefs = useRef<HTMLAudioElement[]>([]);
    const subjectAudioTagRef = useRef<HTMLAudioElement>(null);

    const formRef = useRef<HTMLFormElement>(null);

    const files = data?.intra_pair_files || [];
    const assignedTo = data?.assignedTo;
    // const createdBy = data?.created_by || [];
    const groupSize = data?.group_size || Infinity;

    const [updatedAudio, setUpdatedAudio] = React.useState(false);

    const [calculatedThreshold, setCalculatedThreshold] = React.useState<number>(1);

    const referenceAudios = useMemo(() => {
        return files.filter((file: any) => file.is_reference);
    },[files]);

    const subjectAudios = useMemo(() => {
        return files.filter((file: any) => !file.is_reference);
    },[files]);

    const currentFile = useMemo(() => intraFileLogic(subjectAudios,groupSize), [files, groupSize]);
    const isThreshFound = useMemo(() => isThresholdFound(subjectAudios,groupSize), [currentFile, files]);

    useEffect(() => {

        if(isThreshFound) {
            setCalculatedThreshold(calculateCosineThreshold(subjectAudios));
        }

    }, [isThreshFound]);

    useEffect(() => {
        setUpdatedAudio(true);
        setTimeout(() => {
            setUpdatedAudio(false);
        }, 3000);
    }, [currentFile]);

    console.log(currentFile);

    const playReferenceAudio = (index: number) => () => {

        referenceAudioTagRefs.current.forEach((audioTagRef) => {
            audioTagRef.pause();
        });

        subjectAudioTagRef.current?.pause();

        referenceAudioTagRefs.current[index].play().then(() => {
            console.log("played");
        }).catch(console.error);

    }

    const onSubmitHandler = async (e : React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const file_uuid = currentFile?.uuid;

        // @ts-ignore
        const confidenceArr = Array.from(e.target["confidence"]).filter((el : any) => el.checked).map((el : any) => el.value);
        if(confidenceArr.length !== 1) {
            alert("Please select one confidence");
            return;
        }
        const confidence = confidenceArr[0];

        // @ts-ignore
        const similarArr = Array.from(e.target["similar"]).filter((el : any) => el.checked).map((el : any) => el.value);
        if(similarArr.length !== 1) {
            alert("Please select one similar");
            return;
        }

        const is_similar = similarArr[0] === "yes";

        try {
             await axios.post(`/api/v1/intra/${intraJobUuid}/answer`, {
                confidence,
                is_similar,
                file_uuid
            });

            await mutate();

            formRef.current?.reset();
            window.scroll(0,0);

            toast("Submitted Successfully", {
                type: "success"
            });
        }
        catch (e)   {
            toast("Failed to submit", {
                type: "error"
            });
        }

    }

    const completeTask = async () => {
        try {
            await axios.post(`/api/v1/intra/${intraJobUuid}/complete`, {
                threshold: calculatedThreshold
            });
            toast("Task Completed Successfully", {
                type: "success"
            });
            router.push("/intra");
        }
        catch (e)   {
            toast("Failed to complete task", {
                type: "error"
            });
        }
    }


    if (error) return <div>failed to load</div>
    if (isLoading) return <Loader isLoading={true} ><></></Loader>

    return (
        <div className={"flex justify-center items-center py-4"}>
            <Head>
                <title>
                    Intra Job :&nbsp;
                    {
                        data.name
                    }
                </title>
            </Head>
            <div className="max-w-md w-full">
                <div>

                    <div>
                        <div>
                            <h2 className="text-xl font-bold">Intra Pair job</h2>
                        </div>
                        <div className="mt-3 flex gap-3 flex-wrap ">
                            Task Assigned to : { !!assignedTo ? assignedTo.name  : "Not Assigned"}
                        </div>
                    </div>

                    {
                        !isThreshFound &&
                        <>
                            <div className={"mt-8"}>
                                <h2 className="text-lg font-bold">Reference Audios</h2>
                            </div>
                            <ul role="list" className="mt-3 flex gap-3 flex-wrap ">
                                {referenceAudios.map((referenceAudio: any, i: number) => (
                                    <li key={referenceAudio.uuid}
                                        className="grow-1 flex-1 flex rounded-md shadow-sm max-w-md">
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
                                        <div
                                            className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
                                            <div className="flex-1 truncate px-4 py-2 text-sm">
                                                <Link target={'__blank'} href={referenceAudio.file}
                                                      className="font-medium text-gray-900 hover:text-gray-600 truncate">
                                                    {referenceAudio.file_name}
                                                </Link>
                                            </div>
                                            <audio src={referenceAudio.file} ref={(r) => {
                                                // @ts-ignore
                                                referenceAudioTagRefs.current.splice(i, 1, r);
                                            }}></audio>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                    </>
                    }
                    {
                        isThreshFound &&
                        <>
                            <div className={"mt-8"}>
                                <h2 className="text-lg text-center">Calculated Threshold</h2>
                                <h3 className={"text-2xl text-center font-bold"}>{calculatedThreshold}</h3>
                            </div>
                        </>
                    }




                    {
                        currentFile && <>
                            <div>
                                <h2 className="text-lg font-bold py-4">Subject Audio</h2>
                            </div>
                        <div className="col-span-1 flex rounded-md shadow-sm">
                            <div
                                className={clsx(
                                    "bg-red-600",
                                    'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
                                )}
                            >
                                <PlayIcon className={"h-12 py-2"}/>
                            </div>
                            <div
                                className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
                                <div className="flex-1 truncate px-4 py-2 text-sm">
                                    <Link target={"__blank"} href={currentFile.file}
                                          className="font-medium text-gray-900 hover:text-gray-600">
                                        {
                                            currentFile.file_name
                                        }
                                    </Link>
                                </div>
                            </div>
                        </div>
                        </>
                    }

                    {
                        updatedAudio && currentFile && <span className={"mt-4 text-green-500"}>Audio updated</span>
                    }
                </div>

                {
                    currentFile &&
                    <form onSubmit={onSubmitHandler} ref={formRef}>
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
                                    <input type="radio" name={"similar"} value={"yes"} id={"yes"}/>
                                    <label htmlFor={"yes"} className={"ml-2 text-primary"}>Yes</label>
                                </fieldset>
                                <fieldset>
                                    <input type="radio" name={"similar"} value={"no"} id={"no"}/>
                                    <label htmlFor={"no"} className={"ml-2 text-secondary"}>No</label>
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
                                    <input type="radio" name={"confidence"} value={"high"} id={"veryC"}/>
                                    <label htmlFor={"veryC"} className={"ml-2 text-primary"}>Very Confident</label>
                                </fieldset>
                                <fieldset>
                                    <input type="radio" name={"confidence"} value={"medium"} id={"somewhatC"}/>
                                    <label htmlFor={"somewhatC"} className={"ml-2 text-secondary"}>Confident</label>
                                </fieldset>
                                <fieldset className={""}>
                                    <input type="radio" name={"confidence"} value={"low"} id={"lessC"}/>
                                    <label htmlFor={"lessC"} className={"ml-2 text-error"}>Less Confident</label>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className={"mt-6"}>
                        <button type={"submit"} className={"btn btn-primary w-full"}>
                            Next
                        </button>
                    </div>
                </form>}
                {
                    isThreshFound && !currentFile &&
                    <>
                        <button className={"btn btn-primary w-full mt-8"} onClick={completeTask}>
                            Complete & Submit Task
                        </button>
                        <span className={"text-sm text-zinc-400"}>Note: It is mandatory to click complete task.</span>
                    </>
                }
            </div>
        </div>
    );
};

Examine.propTypes = {

};

export default Examine;