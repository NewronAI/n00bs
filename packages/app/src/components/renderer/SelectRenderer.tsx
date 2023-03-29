import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';

export default (props: ICellRendererParams) => (
  <span>
    {props.value}
  </span>
);
