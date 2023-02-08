import React from 'react'
import { ClipLoader } from 'react-spinners';


type LoaderProps={
    isLoading:boolean;
    error: string;
    children:string|JSX.Element|JSX.Element[];
}


function Loader({ children, isLoading , error} :LoaderProps) {

    if (error && !isLoading) {
        return (
            <div className="flex items-center justify-center h-[200px]">
                <h1 className="text-2xl font-semibold text-gray-700">Error loading data : {error}</h1>
            </div>
        )

    }

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