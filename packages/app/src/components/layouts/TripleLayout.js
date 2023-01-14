import React from 'react';
import PropTypes from 'prop-types';


/*

    Layout style:
    +-------------------+-------------------+-------------------+
    |                                       |                   |
    |               Left Top                |                   |
    |                                       |                   |
    +-------------------+-------------------|                   |
    |                                       |       Right       |
    |                                       |                   |
    |                 Main                  |                   |
    |                                       |                   |
    |                                       |                   |
    +-------------------+-------------------+-------------------+

 */

const TripleLayout = ({topLeft, center, right}) => {
    return (
        <div className="mx-auto w-full max-w-7xl flex-grow lg:flex xl:px-8">
            {/* Left sidebar & main wrapper */}
            <div className="min-w-0 flex-1">
                {
                    topLeft &&
                    <div
                        className=" xl:flex-shrink-0 xl:border-b-0 xl:border-r xl:border-zinc-200">
                        <div className="h-full py-6 pl-4 pr-6 sm:pl-0 lg:pl-0 xl:pl-0 ">
                            {/* Start left column area */}
                            {topLeft}
                            {/* End left column area */}
                        </div>
                    </div>
                }

                {
                    center &&
                    <div className="lg:min-w-0 lg:flex-1">
                        <div className="h-full py-6 px-4 sm:px-0 lg:px-0">
                            {/* Start main area*/}
                            {center}
                            {/* End main area */}
                        </div>
                    </div>
                }
            </div>

            {
                right &&
                <div className=" pr-4 sm:pr-6 lg:flex-shrink-0 lg:border-l lg:border-zinc-200 lg:pr-8 xl:pr-0">
                    <div className="h-full py-6 pl-6 lg:w-80">
                        {/* Start right column area */}
                        {right}
                        {/* End right column area */}
                    </div>
                </div>
            }
        </div>
    );
};

TripleLayout.propTypes = {
    topLeft: PropTypes.node,
    center: PropTypes.node,
    right: PropTypes.node,
};

export default TripleLayout;