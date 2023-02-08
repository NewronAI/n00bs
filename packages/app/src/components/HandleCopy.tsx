import React from 'react';
import {ClipboardIcon} from "@heroicons/react/outline";

interface HandleCopyProps {
    text: string;
}

const HandleCopy = (props : HandleCopyProps) => {

    const text = props.text;

    const [copied, setCopied] = React.useState<boolean>(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <button onClick={handleCopy} disabled={copied}>
            {
                copied ? <span className={"text-primary"}>Copied</span> : <ClipboardIcon className={"h-4 w-4"} />
            }
        </button>
    );
};

HandleCopy.propTypes = {

};

export default HandleCopy;