import React from "react";
import FaceDetectionAntiSpoofing from '../FaceDetectionAntiSpoofing/FaceDetectionAntiSpoofing'
import {DragDrop} from "../DragDrop/DragDrop";
// import "./content.css"

const Content = () => {
    return(
        <div className={'App'}>
            {/*<FaceDetectionAntiSpoofing/>*/}
            <DragDrop/>
        </div>
    )
}

export default Content