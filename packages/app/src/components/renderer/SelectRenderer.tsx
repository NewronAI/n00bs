import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';

const SelectRenderer =  (props: ICellRendererParams) => (
  <span>
    {props.value}
  </span>
);

export default SelectRenderer;