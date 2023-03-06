import React from 'react';

import { StarIcon as StarUnfilled } from '@heroicons/react/outline';
import { StarIcon as StarFilled } from '@heroicons/react/solid';



type RatingViewerProps = {
    value: number | string,
    data: any
}

const RatingViewer = ({ value, data }: RatingViewerProps) => {

    let val = 0;

    if (typeof value === "string") {
        val = parseInt(value);

        if (isNaN(val)) {
            return null;
        }

    }
    else if (typeof value === "number") {
        val = value;
    }
    else {
        return null;
    }

    const stars = [];

    for (let i = 0; i < 5; i++) {
        if (i < val) {
            stars.push(<StarFilled className="h-6" />)
        }
        else {
            stars.push(<StarUnfilled className="h-5" />)
        }
    }

    return <div className='flex gap-1/2 items-center h-full'>
        {
            stars
        }
    </div>
}

export default RatingViewer;