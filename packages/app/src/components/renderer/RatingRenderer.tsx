import React, {ReactNode} from 'react'
import clsx from "clsx";

type RatingRendererProps = {
    value?: number | string | null,
    data: any,
    onRatingChange?: (value : number, data: any) => void
}

const RatingRenderer = ({value, data, onRatingChange} : RatingRendererProps) => {

    const disabled = !onRatingChange;

    const handleOnRatingChange = (e : React.MouseEvent<HTMLInputElement>) => {
        if(onRatingChange) {
            // onRatingChange(Number(e.target.value), data);
        }
    }

    return <div className=''>
        <div className="rating">
            {
                (() => {
                    let stars : ReactNode[] = [];
                    for(let i = 0; i < 5; i++) {
                         (
                             stars.push(<input type="radio" onClick={handleOnRatingChange} key={i} value={i} name={data.name} className={clsx("mask mask-star-2",
                                    {"bg-orange-400": !!value, "bg-zinc-200 opacity-20": !value})}
                                               disabled={disabled} checked={(i+1) === Math.floor(Number(value))} />)
                        )
                    }
                    return stars;
                })()
            }
        </div>
    </div>

}

export default RatingRenderer
