import { FileUploader } from "react-drag-drop-files";
import React from 'react'
import './drag_drop.css'

export const DragDrop = () => {
    const fileTypes = ["jpeg", " png", " jpg"];
    const handleChange = (file) => {
        // setFile(file);
        console.log(file)
    };

    return(
        <div className={'drop_drag'}>
            <FileUploader
                multiple={true}
                label = {'Drop or Drag your CIN please'}
                handleChange={handleChange}
                name="file"
                types={fileTypes}
                maxSize={10}
            />
        </div>
    )
}