export default function Data() {
    return (
        <div className="items-center mt-12 mx-56">
            <div>
            <h1 className='font-bold text-2xl'>Data Funnel </h1>
            <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
            <div className='grid grid-cols-4 gap-4'>
                <div className="card w-54 bg-green-400 text-black shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Speech data collected</h2>
                        <p>Magdap -  4376 Hrs </p>
                        <p>Shapi - 3950 Hrs</p>
                    </div>
                </div>
                <div className="card w-54 bg-green-400 text-black shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Speech data delivered</h2>
                        <p>Magdap -  978.699 Hrs </p>
                        <p>Shapi - 187.587 Hrs</p>
                    </div>
                </div>
                <div className="card w-54 bg-green-400 text-black shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Speech data passed QC</h2>
                        <p>Magdap -  0 Hrs</p>
                        <p>Shapi - 0 Hrs</p>
                    </div>
                </div>
                <div className="card w-54 bg-green-400 text-black shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Data uploaded</h2>
                        <p className='mt-6'>Magdap - 0 Hrs</p>
                        <p>Shapi - 0 Hrs</p>
                    </div>
                </div>
                </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <div className='mt-6'>
                    <h1 className='font-bold text-2xl'>Geographical Presence</h1>
                    <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                    <div className='grid grid-cols-2 gap-4'>
                        <div className="card w-54 bg-green-400 text-black shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Data collection</h2>
                                <p>Magdap -  80 Districts</p>
                                <p>Shapi - 80 Districts</p>
                            </div>
                        </div>
                        <div className="card w-54 bg-green-400 text-black shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">QC</h2>
                                <p>QC of 79 Districts</p>
                                <p>438 Freelancers</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='mt-6'>
                    <h1 className='font-bold text-2xl'>Images Collected</h1>
                    <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                        <div className="card w-1/2 bg-green-400 text-black shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Total Images Collected</h2>
                                <p>1,29,218</p>
                            </div>
                        </div>
                </div>
            </div>
            <div className='mt-6 pb-32'>
                    <h1 className='font-bold text-2xl'>Summary</h1>
                    <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                    <p>Our data funnel currently shows that we have collected a total of 6000 hours of speech data for Megdap and 3950 hours for Shaip. Of that, 978 hours of Megdap and 208 hours of Shaip have been delivered and submitted for Quality Control. Currently, none of the speech data has passed QC and none of the data has been uploaded.</p>
                    <p>In terms of geographical presence, we have a broad reach in terms of data collection. We have data collection efforts ongoing in 80 districts for Megdap and 80 districts for Shaip. This represents a diverse range of regions and allows us to gather data from a wide range of demographic groups.</p>
                    <p>For Quality Control, we have 79 districts covered and 438 freelancers working on it, ensuring that the data is accurate, and unbiased.</p>
                    <p>In addition to speech data, we have also collected a total of 1,29,218 images. These images will be used in conjunction with the speech data to provide a more comprehensive understanding of the data.</p>
            </div>
        </div>
    )
}
