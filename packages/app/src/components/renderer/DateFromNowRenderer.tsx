import React from 'react'
import moment from 'moment'

type DateFromNowRendererProps = {
  value?: string
}

const DateFromNowRenderer = ({ value }: DateFromNowRendererProps) => {

  if (!value) {
    return null;
  }

  return (
    <div>{moment(value).fromNow()}</div>
  )
}

export default DateFromNowRenderer