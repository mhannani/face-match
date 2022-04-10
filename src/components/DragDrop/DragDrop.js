import { FileUploader } from "react-drag-drop-files";
import React, {useEffect, useState} from 'react'
import Card from "./card.png"
import './drag_drop.css'
import {useDispatch, useSelector} from "react-redux";
import {setFilename, setGuid, setIsUploaded, setUploadedFile} from "../../store/uploadSlice";
import Loading from "../Loading/Loading";
import {setIsLoading} from "../../store/uploadSlice";
import {Button} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {setStartLiveness} from "../../store/AppSlice";

const fileTypes = ["jpg", "png", "jpeg"];


export const DragDrop = () => {
    const is_uploaded = useSelector((state) => state.upload.is_uploaded)
    const uploaded_file = useSelector((state) => state.upload.uploaded_file)
    const filename = useSelector((state) => state.upload.filename)
    const is_loading = useSelector((state) => state.upload.is_loading)
    const dispatch = useDispatch()

    const handleChange = (file) => {
        dispatch(setIsUploaded(true))
        // console.log(file.lastModified)
        dispatch(setGuid(file.lastModified))
        let reader  = new FileReader();
        let image = document.getElementById("uploaded-img");
        reader.onload = function () {
            // image.src = reader.result
            dispatch(setUploadedFile(reader.result))
            dispatch(setFilename(file.name))
            image.alt = file.name
        };
        reader.readAsDataURL(file);
    };

    const continue_job = () => {
        dispatch(setStartLiveness(true))
    }

    useEffect(()=>{
        setTimeout(() => {
            dispatch(setIsLoading(false))
        }, 2000)
    }, [])

    return (
        <div className={'drop_drag'}>
            {is_loading ?
                    <Loading message={'Loading...'}/>
                :
                <>
                    <h2>Let's begin by uploading your ID card.</h2>

                    <FileUploader
                        handleChange={handleChange}
                        name="file"
                        types={fileTypes} />
                    <img src={uploaded_file} id={'uploaded-img'} alt={''}/>
                    {/*{!is_uploaded  && <img src={Card} alt="#"/>}*/}
                    <code>{filename}</code>

                        <Button color="success"
                            sx={{borderRadius: 0}}
                            disabled={!is_uploaded}
                            variant="contained"
                            onClick={continue_job}
                            endIcon={<PlayArrowIcon/>}
                        >
                            Continue
                        </Button>

                </>
            }
        </div>
    );
}