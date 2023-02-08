import React from 'react'
import {DocumentIcon, PhotographIcon, VideoCameraIcon, VolumeUpIcon} from '@heroicons/react/outline'
import {file_type} from '@prisma/client';

type FileTypeRendererProps = {
    value: file_type
}

const FileTypeRenderer = ({value} : FileTypeRendererProps) => {
    return <div className='p-2'>
    {(() => {
        switch(value) {
        case file_type.audio: return (
            <VolumeUpIcon className='h-5' />
        );
        case file_type.video: return(
            <VideoCameraIcon className='h-5' />
        )
        case file_type.image: return(
            <PhotographIcon className='h-5' />
        )
        case file_type.document: return(
            <DocumentIcon className='h-5' />
        )
    }})()}
    </div>

}

export default FileTypeRenderer
