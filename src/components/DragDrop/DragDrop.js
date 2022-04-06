import { FileUploader } from "react-drag-drop-files";
import React from 'react'
import './drag_drop.css'

export const DragDrop = ()=>{
    const fileTypes = ["JPEG", " PNG"];

    return(
        <div className={'drop_drag'}>
            <FileUploader
                multiple={false}
                label = {'Drop or Drag your CIN please'}
                // handleChange={handleChange}
                name="file"
                types={fileTypes}
            />
        </div>

    )
}