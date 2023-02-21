import React, {useMemo, useRef} from 'react';
import {Prisma} from "@prisma/client";
import axios from "axios";
import {Tooltip} from "react-tooltip";
import {IdentificationIcon} from "@heroicons/react/outline";


const FilenameRenderer = ({value} : {value : string}) => {

    const fileName = useMemo(() => value?.split("/").pop(), [value]);


    return (
        <div>
            {fileName}
        </div>
    );
};


export default FilenameRenderer;