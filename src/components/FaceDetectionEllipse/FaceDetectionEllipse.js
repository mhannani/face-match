import {useSnackbar} from "notistack";
import React, {useState} from "react";
import {loadModels} from "../../helpers/faceApi";
import Camera from '../Camera/Camera';
import {Button} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {canCheckLiveness, reset} from "../../store/faceSlice";

const FaceDetectionEllipse = () =>{
    const { enqueueSnackbar } = useSnackbar();
    const face_detected = useSelector((state) => state.face.face_detected)
    const [mode, setMode] = useState(false); //true = photo mode; false = video mode
    const dispatch = useDispatch()

    loadModels().then(()=>{
        enqueueSnackbar('ML models loaded successfully !', { variant: 'success' })
    });

    return(
        <>
            {
                face_detected ?  <div>
                        <Button variant="contained" onClick={()=>{dispatch(canCheckLiveness())}}> Do liveness Check</Button>
                        <Button variant="contained" style={{marginLeft: '2px'}} onClick={()=>{dispatch(reset())}}>Reset</Button>
                </div>:
                    <Button variant="contained" disabled>Do liveness Check</Button>
            }

            <Camera photoMode={mode} />

        </>

    )
}

export default FaceDetectionEllipse