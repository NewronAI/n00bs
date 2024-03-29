import React from 'react'

type UrlRendererProps = {
  value: string
}

const UrlRenderer = ({value}: UrlRendererProps) => {
  return (
    <a className='text-indigo-200' href={value} target={"_blank"} rel={"noreferrer"}>{value}</a>
  )
}

export default UrlRenderer
