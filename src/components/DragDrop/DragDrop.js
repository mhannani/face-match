import { FileUploader } from "react-drag-drop-files";
import React, {useState} from 'react'
import Card from "./card.png"
import './drag_drop.css'
import {useDispatch, useSelector} from "react-redux";
import {setFilename, setIsUploaded, setUploadedFile} from "../../store/uploadSlice";
const fileTypes = ["jpg", "png", "jpeg"];

export const DragDrop = () => {
    const is_uploaded = useSelector((state) => state.upload.is_uploaded)
    const uploaded_file = useSelector((state) => state.upload.uploaded_file)
    const filename = useSelector((state) => state.upload.filename)
    const dispatch = useDispatch()

    const handleChange = (file) => {
        console.log(file)
        dispatch(setIsUploaded(true))
        let reader  = new FileReader();
        let image = document.getElementById("uploaded-img");
        reader.onload = function () {
            image.src = reader.result
            dispatch(setUploadedFile(reader.result))
            dispatch(setFilename(file.name))
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
            <img src={''} id={'uploaded-img'} alt={''}/>
            {!is_uploaded  && <img src={Card} alt="#"/>}
            <p>{filename}</p>
        </div>
    );
}