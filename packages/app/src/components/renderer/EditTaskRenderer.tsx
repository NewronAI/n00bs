import React from 'react'

type EditTaskRendererProps = {
    data: any;
}

const EditTaskRenderer = ({data}: EditTaskRendererProps) => {
    console.log(data)
  return (
    <div>
        <button className='btn btn-sm btn-secondary mr-2' >Delete</button>
        <button className='btn btn-sm btn-primary' >edit</button>
    </div>
  )
}

export default EditTaskRenderer