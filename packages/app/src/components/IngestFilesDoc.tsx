import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import getPublicWorkflowAPISecret from "@/helpers/getPublicWorkflowAPISecret";
import {ClipboardIcon} from "@heroicons/react/outline";
import HandleCopy from "@/components/HandleCopy";



const IngestFilesDoc = ({workflowUUID = "7d1b4c3d-51f6-4902-97b3-8fb9fd1e1aff"} : {workflowUUID?: string}) => {

    const [secret, setSecret] = React.useState<string>("");

    const [workflowAPIURL, setWorkflowAPIURL] = React.useState<string>(`/api/v1/${workflowUUID}/public/file`);

    useEffect(() => {
        getPublicWorkflowAPISecret(workflowUUID).then((secret) => {
            setSecret(secret);
        });
        setWorkflowAPIURL(`${typeof window === "object" ? window.location.origin : ""}/api/v1/${workflowUUID}/public/file`)
    }, [workflowUUID]);


    return (
        <div className={"p-4"}>
            <div className={""}>
                <h1 className={"text-lg font-semibold"}>
                    Ingesting Files
                </h1>
            </div>
            <div className={"mt-2"}>
                <p className={"text-sm font-thin"}>
                    Files are the core of the workflow. Files are required to be ingested into the workflow before they can be assigned to a person. Files can be ingested using the API.
                </p>
                <p className={"text-sm font-thin"}>
                    To ingest files into this workflow, you can use the following API endpoint:
                </p>
            </div>

            <div className={"mt-2"}>
                <div className={"bg-neutral p-2 rounded-md"}>
                    <div className={"flex justify-between"}>
                        <h2>
                            <span className={"text-secondary mr-2"}>POST </span> {workflowAPIURL}
                        </h2>
                        <HandleCopy text={workflowAPIURL} />
                    </div>

                    <div className="collapse mt-4">
                        <input type="checkbox" className="peer" defaultChecked/>
                        <div className="collapse-title bg-neutral peer-checked:bg-secondary peer-checked:text-secondary-content rounded-t-lg">
                            <h3 className={"font-semibold"}>
                                Request Body
                            </h3>
                        </div>
                        <div className="collapse-content peer-checked:bg-secondary peer-checked:text-secondary-content rounded-b-lg">
                            <p>
                                <code className={"font-thin text-sm"}>
                                    <span className={"text-indigo-900"}>{"{"}</span>
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"secret": "{secret}",</span> // The secret for this workflow only
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>data: &#91;</span>
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>&#123;</span>
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"file_name": "file name",</span> // required
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"file_type": "file type",</span> // one of: "image", "video", "audio", "document"
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"file": "file url",</span> // url of the file (required)
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"file_duration": "file duration",</span> // Duration of file // optional
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"district": "district name",</span> // optional
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"state": "state name",</span> // optional
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"vendor": "vendor name",</span> // optional
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"metadata": &#123;</span> //optional
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>"key": "value",</span> // metadata key value pairs
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>&#125;</span>
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>{"}"}</span>
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={"text-indigo-900"}>&#93;</span>
                                    <br />


                                    <span className={"text-indigo-900"}>{"}"}</span>
                                </code>
                            </p>
                        </div>
                    </div>

                    <div className={"mt-4 px-4"}>
                        <h3 className={"font-semibold"}>
                            Response
                        </h3>
                        <p className={"font-thin text-sm"}>
                            Status Code: <code>200</code>
                        </p>
                    </div>
                </div>

                <div className={"mt-4"}>
                    <h3 className={"font-semibold"}>
                        Further steps
                    </h3>
                    <p className={"text-sm font-thin"}>
                        After ingesting files, you can start assigning them to people using the Assign Files. On successful assignment, the file will be moved to the "Assigned" tab.
                        Also, the provided callback URL will be called with the file and task details.
                    </p>
                    <p className={"text-sm font-thin"}>
                        <span className={"text-secondary"}>Note:&nbsp;</span>
                        You need to have task, people and files in the workflow before you can assign files.
                    </p>
                </div>
            </div>

        </div>
    );
};

IngestFilesDoc.propTypes = {

};

export default IngestFilesDoc;