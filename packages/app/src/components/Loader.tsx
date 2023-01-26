import React from 'react'
import { ClipLoader } from 'react-spinners';


type LoaderProps={
    isLoading:boolean;
    children:string|JSX.Element|JSX.Element[];
}


function Loader({ children, isLoading } :LoaderProps) { 

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[200px]">
                <ClipLoader size={50} color={'#123abc'} />
            </div>
        )
    }
    return <>{children}</>

}

export default Loader