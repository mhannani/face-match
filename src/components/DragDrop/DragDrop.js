import { FileUploader } from "react-drag-drop-files";
import React, {useState} from 'react'
import './drag_drop.css'
const fileTypes = ["jpg", "png", "jpeg"];

export const DragDrop = () => {
    const [file, setFile] = useState(null);
    const handleChange = (file) => {
        setFile(file);
        console.log(file)
        console.log(file.lastModified)
    };

    return (
        <div className={'drop_drag'}>
            <FileUploader
                handleChange={handleChange}
                name="file"
                types={fileTypes} />
        </div>
    );
}