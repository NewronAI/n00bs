// noinspection ES6UnusedImports

import React, {useEffect, useMemo, useRef} from 'react';
import {ITooltipParams} from "ag-grid-community";
import {ITooltipReactComp as _} from "ag-grid-react";
import {Prisma} from "@prisma/client";
import axios from "axios";

const FileAssignmentTooltip = (props: ITooltipParams & {workflowUUID : string}) => {

    const data = useMemo<{uuid : string}>(() => props.api.getDisplayedRowAtIndex(props.rowIndex || 0)?.data, []);

    const workflowUUID = props.workflowUUID;

    const value = props.value;
    const valueInt = parseInt(value as string);

    const [isDataFetched, setIsDataFetched] = React.useState(false);

    const fileUUID = data?.uuid;
    const isBeingCalled = useRef(false);
    const [assignedTo, setAssignedTo] = React.useState<Prisma.memberSelect[]>([]);

    const element = useRef<HTMLDivElement>(null);

    const onInView = async () => {

        if(assignedTo.length > 0) {
            console.log("already fetched")
            return;
        }
        if(isBeingCalled.current || !value || valueInt < 0) {
            console.log("already being called");
            return;
        }

        isBeingCalled.current = true;
        try {
            const res = await axios.get(`/api/v1/${workflowUUID}/file/assignees`, {
                params: {
                    "file-uuid": fileUUID
                }
            });
            setAssignedTo(res.data);
            setIsDataFetched(true);
        } catch (e) {
            console.log(e);
            setIsDataFetched(false);
        }
        isBeingCalled.current = false;
    }

    useEffect(() => {

        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                onInView().then(() => {
                    observer.disconnect();
                });
            }
        }, {threshold: 0.5});

        observer.observe(element.current as Element);

        return () => {
            observer.disconnect();
        }

    }, []);


    if(props.rowIndex === undefined) return null;

    return (
        <div ref={element} className={"bg-black text-white p-2 rounded shadow-md"}>
            {
                !isDataFetched &&
                <div className={"flex flex-col gap-2"}>
                    Loading...
                </div>
            }
            {
                isDataFetched &&
                <div className={"flex flex-col text-xs"}>
                    {assignedTo.map((member, i) => (
                        <div key={i} >
                            <div className={"flex flex-col gap-0"}>
                                <div>
                                    {member.name}
                                </div>
                                <div>
                                    {member.district}, {member.state}
                                </div>
                                <div>
                                    {member.phone}
                                </div>
                            </div>
                            <hr/>
                        </div>
                    ))}
                </div>
            }
        </div>
    )

}

export default FileAssignmentTooltip;