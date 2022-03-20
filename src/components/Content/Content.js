import React, {useState} from "react";
import FaceDetectionEllipse from '../FaceDetectionEllipse/FaceDetectionEllipse'
import FaceDetectionAntiSpoofing from '../FaceDetectionAntiSpoofing/FaceDetectionAntiSpoofing'


import "./content.css"

import {useDispatch, useSelector} from "react-redux";
import {Button} from "@mui/material";
import {canCheckLiveness} from "../../store/faceSlice";

const Content = ()=>{
    const face_detected = useSelector((state) => state.face.face_detected)
    const do_liveness = useSelector((state) => state.face.do_liveness)
    const dispatch = useDispatch()

    return(
        <div className={'App'}>
            {/*<header>*/}
            {/*    <div className="App__header">*/}
            {/*        <div className="App__switcher">*/}
            {/*            <h2>Face detection</h2>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</header>*/}
            <div style={{color: '#2ac92a', fontWeight: 700, marginBottom: '10px'}}>
                Checks:
            </div>
            <div className={'results'}>
                <div className={'child'}>- Face detection:
                    {face_detected ? <h6 style={{color: '#2ac92a'}}> Face detected ! </h6>: <h6 style={{color: '#ff0000'}}> No face detected </h6>}
                </div>
                <div className={'child'}>- Can do liveness check ? {face_detected ?
                    <h6 style={{color: '#2ac92a'}}> Yes </h6> : <h6 style={{color: '#ff0000'}}> Not yet </h6>}
                </div>

                <br/>
            </div>
            {
                (face_detected && do_liveness) ? <FaceDetectionAntiSpoofing/> :<FaceDetectionEllipse/>
            }


            {/*<FaceDetectionAntiSpoofing/>*/}
            {/*<FaceDetectionEllipse/>*/}
        </div>
    )
}

export default Content