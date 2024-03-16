import React, { ReactNode, useState } from 'react'
import clsx from "clsx";

type RatingRendererProps = {
    value?: number | string | null,
    data: any,
    node: any,
    oldRating: (data: any) => number,
    onRatingChange?: (value: number, data: any) => void
}

const RatingRenderer = ({ value, data, oldRating, onRatingChange, node }: RatingRendererProps) => {

    const old = oldRating(data) || null;




    const [rating, setRating] = useState(value || 0);

    const disabled = !onRatingChange;

    const handleOnRatingChange = (newRating: number) => () => {
        setRating(newRating);
        if (onRatingChange) {
            onRatingChange(newRating, data);
        }
    }

    if (node.group) {
        return null;
    }

    return <div className=''>
        <div className="rating">
            {
                (() => {
                    let stars: ReactNode[] = [];
                    for (let i = 0; i < 5; i++) {
                        (
                            stars.push(<input type="radio" onClick={handleOnRatingChange(i + 1)} key={i} value={i} name={data?.name} className={clsx("mask mask-star-2",
                                { "bg-orange-300": old !== null && i < old, "bg-orange-400": i < rating, "bg-zinc-900 opacity-20": !rating && !old })}
                                disabled={disabled} checked={(i + 1) === Math.floor(Number(value))} />)
                        )
                    }
                    return stars;
                })()
            }
        </div>
    </div>

}

export default RatingRenderer
