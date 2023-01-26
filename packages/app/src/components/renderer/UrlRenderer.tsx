import React from 'react'

const UrlRenderer = ({value}) => {
  return (
    <a className='text-indigo-200' href={value}>{value}</a>
  )
}

export default UrlRenderer