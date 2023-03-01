import { ExclamationCircleIcon } from "@heroicons/react/outline";
import Papa from "papaparse";
import React, { useMemo, useState } from "react";
import axios from "axios";

interface ImportDataProps {
    projectSlug: string;
    onCancel: () => void;
    onDatasetImported: () => void;
}

const ImportData: React.FC<ImportDataProps> = ({ projectSlug, onCancel, onDatasetImported }) => {
    const [allHeaders, setAllHeaders] = useState<string[]>([]);
    const [inputHeaders, setInputHeaders] = useState<string[]>([]);
    const [outputHeaders, setOutputHeaders] = useState<string[]>([]);

    const [fileDetails, setFileDetails] = useState<{ name: string; size: number } | null>(null);

    const inputOptions = useMemo(
        () => allHeaders.filter((header) => !outputHeaders.includes(header)).map((header) => ({ value: header, label: header })),
        [allHeaders, outputHeaders]
    );

    const outputOptions = useMemo(
        () => allHeaders.filter((header) => !inputHeaders.includes(header)).map((header) => ({ value: header, label: header })),
        [allHeaders, inputHeaders]
    );

    const [creatingStatus, setCreatingStatus] = useState<{
        isCreating: boolean;
        message: string;
        error: string | null;
    }>({
        isCreating: false,
        message: "Creating mission...",
        error: null,
    });

    const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCreatingStatus({
                isCreating: false,
                message: "",
                error: null,
            });

            setInputHeaders([]);
            setOutputHeaders([]);
            setAllHeaders([]);

            setFileDetails({
                name: file.name,
                size: file.size,
            });

            Papa.parse(file, {
                header: true,
                step: function (results: any) {
                    setAllHeaders(results.meta.fields);
                },
                error(error: Error) {
                    setCreatingStatus({
                        isCreating: false,
                        message: "",
                        error: `Error while parsing the file. Please check the file format and try again. Error: ${error.message}}`,
                    });
                },
            });
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;

        if (!form.file?.files?.length) {
            setCreatingStatus({ isCreating: false, message: "", error: "Please select a file to add to datasets." });
            return;
        }

        try {
            const requestBody: { [key: string]: any } = {};
            const formData = new FormData();

            formData.append("file", form.file?.files?.[0]);
            formData.append("inputFields", JSON.stringify(inputHeaders));
            formData.append("outputFields", JSON.stringify(outputHeaders));

            formData.forEach((value, key) => {
                requestBody[key] = value;
            });

            setCreatingStatus({ isCreating: true, message: "", error: null });

            await axios.post(`${projectSlug}/import-data`, formData);

            setCreatingStatus({ isCreating: false, message: "Dataset has been imported successfully.", error: null });
            onDatasetImported();
        } catch (e) {
            setCreatingStatus({ isCreating: false, message: "", error: "Something went wrong. Please try again later." });
            console.log(e);
        }
    };

    return (
        <form onSubmit={onSubmit} className={"w-full max-h-full p-6 flex flex-col divide-y divide-gray-200 bg-white overflow-auto"}>
            <div className={"space-y-6 pb-6"}>
                <div className={"space-y-2"}>
                    <label htmlFor={"projectName"} className={"block text-red-700 font-medium"}>
                        Import from file
                    </label>

                    <div className={"w-full p-6 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md"}>
                        <div className={"space-y-1 text-center"}>
                            <svg
                                className={"mx-auto h-12 w-12 text-gray-300"}
                                stroke={"currentColor"}
                                fill={"none"}
                                viewBox={"0 0 48 48"}
                                aria-hidden={"true"}
                            >
                                <path
                                    d={
                                        "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    }
                                    strokeWidth={2}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                />
                            </svg>

                            <div className={"text-sm text-gray-500"}>
                                <label htmlFor={"file-upload"} className={"relative text-red-500 font-medium bg-white cursor-pointer"}>
                                    <span>Upload a file</span>
                                    <input
                                        id={"file-upload"}
                                        accept={".csv,.tsv"}
                                        onChange={handleAddFile}
                                        name={"file"}
                                        type={"file"}
                                        className={"sr-only"}
                                    />
                                </label>
                                <span className="pl-1">or drag and drop</span>
                            </div>

                            <p className={"text-xs text-gray-500"}>CSV, TSV Files are supported</p>
                        </div>
                    </div>
                </div>

                {fileDetails && (
                    <div className={"space-y-2"}>
                        <label htmlFor={"projectName"} className={"block text-red-700 font-medium"}>
                            File details
                        </label>

                        <div className={"w-full p-6 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md"}>
                            <div className="space-y-1 text-center">
                                <p className="text-sm text-gray-500">{fileDetails.name}</p>
                                <p className="text-sm text-gray-500">{fileDetails.size} bytes</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className={"space-y-2"}>
                    {creatingStatus.error ? (
                        <div className={"flex items-center gap-2"}>
                            <ExclamationCircleIcon className={"w-5 h-5 text-red-500"} aria-hidden="true" />
                            <p className={"text-sm text-red-500"}>{creatingStatus.error}</p>
                        </div>
                    ) : creatingStatus.isCreating ? (
                        <div className={"flex items-center gap-2"}>
                            <svg className={"animate-spin w-5 h-5 text-red-500"} xmlns={"http://www.w3.org/2000/svg"} fill={"none"} viewBox={"0 0 24 24"}>
                                <circle className={"opacity-25"} cx={"12"} cy={"12"} r={"10"} stroke={"currentColor"} strokeWidth={"4"}></circle>
                                <path className={"opacity-75"} fill={"currentColor"} d={"M4 12a8 8 0 018-8v8H4z"}></path>
                            </svg>
                            <p className={"text-sm text-red-500"}>Creating...</p>
                        </div>
                    ) : (
                        <></>
                    )}

                    {allHeaders.length > 0 ? (
                        <p className={"text-sm text-gray-500"}>
                            Selected {inputHeaders.length} input fields and {outputHeaders.length} output fields. Minimum 1 field required for each.
                        </p>
                    ) : (
                        <></>
                    )}
                </div>
            </div>

            <div className={"pt-6 flex flex-shrink-0 justify-end gap-4"}>
                <button
                    type={"button"}
                    className={
                        "py-2 px-4 text-sm text-gray-700 font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    }
                    onClick={() => onCancel()}
                >
                    Cancel
                </button>
                <button
                    type={"submit"}
                    className={
                        "py-2 px-4 text-sm text-white font-medium flex justify-center bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    }
                >
                    Import Data
                </button>
            </div>
        </form>
    );
};

export default ImportData;
