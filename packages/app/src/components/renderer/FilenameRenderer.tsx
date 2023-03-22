import React, {useMemo, useRef} from 'react';
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