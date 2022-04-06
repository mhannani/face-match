import { FileUploader } from "react-drag-drop-files";
import React, {useState} from 'react'
import './drag_drop.css'
const fileTypes = ["jpg", "png", "jpeg"];

export const DragDrop = () => {
    const [file, setFile] = useState(null);
    const handleChange = (file) => {
        let reader  = new FileReader();
        let image = document.getElementById("uploaded-img");
        reader.onload = function () {
            image.src = reader.result
            image.alt = file.name
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={'drop_drag'}>
            <FileUploader
                handleChange={handleChange}
                name="file"
                types={fileTypes} />

            <img src={'#'} id={'uploaded-img'} alt=""/>
        </div>
    );
}