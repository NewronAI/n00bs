import React, {ReactNode} from 'react'
import clsx from "clsx";

type RatingRendererProps = {
    value?: number | string | null,
    data: any
}

const RatingRenderer = ({value, data} : RatingRendererProps) => {


    return <div className=''>
        <div className="rating">
            {
                (() => {
                    let stars : ReactNode[] = [];
                    for(let i = 0; i < 5; i++) {
                         (
                             stars.push(<input type="radio" name={data.name} className={clsx("mask mask-star-2",
                                    {"bg-orange-400": !!value, "bg-zinc-200 opacity-20": !value})}
                                               disabled={true} checked={(i+1) === Math.floor(Number(value))} />)
                        )
                    }
                    return stars;
                })()
            }
        </div>
    </div>

}

export default RatingRenderer
