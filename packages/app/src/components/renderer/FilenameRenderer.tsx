import React, {useMemo, useRef} from 'react';
import {toast} from "react-toastify";


const FilenameRenderer = ({value} : {value : string | number}) => {

    const fileName = useMemo(() => typeof value === "string" ? value?.split("/").pop() : value, [value]);

    const onCLickCopy = async () => {
        await navigator.clipboard.writeText(value.toString());
        toast("Copied to clipboard", {type: "success", autoClose: 400});
    }


    return (
        <div onClick={onCLickCopy}>
            {fileName}
        </div>
    );
};


export default FilenameRenderer;