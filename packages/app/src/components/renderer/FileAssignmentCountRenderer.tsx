import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Prisma} from "@prisma/client";
import axios from "axios";
import {Tooltip} from "react-tooltip";
import {IdentificationIcon} from "@heroicons/react/outline";


type FileAssignmentCountRendererProps = {
    value: number| string;
    data: any;
    workflowUUID: string;
}

const FileAssignmentCountRenderer = ({value,data, workflowUUID} : FileAssignmentCountRendererProps) => {

    const fileUUID = data?.uuid;
    const isBeingCalled = useRef(false);
    const [assignedTo, setAssignedTo] = React.useState<Prisma.memberSelect[]>([]);

    const valueInt = parseInt(value as string);

    const [tooltipOpen, setTooltipOpen] = React.useState(false);


    const onHover = async () => {

        if(assignedTo.length > 0) {
            setTooltipOpen(true);
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
            setTooltipOpen(true);
        } catch (e) {
            console.log(e);
            setTooltipOpen(false);
        }
        isBeingCalled.current = false;
    }

    const tooltipId = `tooltip-${fileUUID}`;

    return (
        <div className={"z-0"}>
            <div onMouseEnter={onHover} onMouseLeave={() => setTooltipOpen(false)} className={"flex items-center"}>
                {value}
                {
                    valueInt > 0 &&
                        <IdentificationIcon id={tooltipId} className={"h-5 w-5 ml-1 text-gray-400"} />

                }
            </div>
            <Tooltip anchorId={tooltipId}
                     isOpen={tooltipOpen && assignedTo.length > 0}
                     float={true} variant={"dark"}
                     place={"right"}
                     // clickable={true}
                     positionStrategy={"absolute"}
                     className={"p-0"}
                     events={["hover"]}
            >
                {
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
            </Tooltip>
        </div>
    );
};


export default FileAssignmentCountRenderer;