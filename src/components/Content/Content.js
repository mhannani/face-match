import React from "react";
// import FaceDetectionEllipse from '../FaceDetectionEllipse/FaceDetectionEllipse'
import FaceDetectionAntiSpoofing from '../FaceDetectionAntiSpoofing/FaceDetectionAntiSpoofing' // Uses the newest version of tfjs
// import "./content.css"
import {useDispatch, useSelector} from "react-redux";
import {Alert, AlertTitle} from "@mui/material";


const Content = () => {
    // const face_detected = useSelector((state) => state.face.face_detected)
    // const do_liveness = useSelector((state) => state.face.do_liveness)
    const face_detected = useSelector((state) => state.face.face_detected)
    const is_spoof = useSelector((state) => state.face.is_spoof)
    const dispatch = useDispatch()

    return(
        <div className={'App'}>
            <FaceDetectionAntiSpoofing/>
        </div>
    )
}

export default Content