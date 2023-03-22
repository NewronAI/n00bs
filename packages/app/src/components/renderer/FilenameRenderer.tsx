import React, {useMemo, useRef} from 'react';
import {Prisma} from "@prisma/client";
import axios from "axios";
import {Tooltip} from "react-tooltip";
import {IdentificationIcon} from "@heroicons/react/outline";
import {toast} from "react-toastify";


const FilenameRenderer = ({value} : {value : string}) => {

    const fileName = useMemo(() => value?.split("/").pop(), [value]);

    const onCLickCopy = async () => {
        await navigator.clipboard.writeText(value);
        toast("Copied to clipboard", {type: "success", autoClose: 400});
    }


    return (
        <div onClick={onCLickCopy}>
            {fileName}
        </div>
    );
};


export default FilenameRenderer;