import React from "react";
import FaceDetectionAntiSpoofing from '../FaceDetectionAntiSpoofing/FaceDetectionAntiSpoofing'
import {DragDrop} from "../DragDrop/DragDrop";
import {useSelector} from "react-redux";
// import "./content.css"

const Content = () => {
    const start_liveness = useSelector((state) => state.app.start_liveness)
    return(
        <div className={'App'}>
            {
                start_liveness ? <FaceDetectionAntiSpoofing/> : <DragDrop/>
            }

        </div>
    )
}

export default Content