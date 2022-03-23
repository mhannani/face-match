import React, {useEffect, useRef, useState} from 'react'
// import setupPage from '../../helpers/anti-spoofing'
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import './face_detection_anti_spoofing.css'
import avatarpng from '../../assets/avatar.png'
import Webcam from "react-webcam";
import classnames from "classnames";
import {setAsReal, setAsSpoof, reset} from "../../store/faceSlice";

import {useDispatch, useSelector} from "react-redux";
import {Alert, AlertTitle, Button} from "@mui/material";
import {useSnackbar} from "notistack";
import {round} from "@tensorflow/tfjs";

const svgIcon = () => (
    <svg
        width="100%"
        height="100%"
        className="svg"
        viewBox="0 0 260 200"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink">
        <defs>
            <mask id="overlay-mask" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="#fff"/>
                <ellipse id="ellipse-mask" cx="50%" cy="50%" rx="50" ry="70" />
            </mask>
        </defs>

        <rect x="0" y="0" width="110%" height="100%" mask="url(#overlay-mask)" fillOpacity="0.7"/>
    </svg>
);

const avatar = ()=>(
    <svg xmlns="http://www.w3.org/2000/svg" id="Ebene_1" data-name="Ebene 1" viewBox="0 -47 300 400">
        <defs>
            {/*<style>.cls-1{fill:#d8d8d8;}</style>*/}
        </defs>
        <path className="cls-1" d="M300,400H.07C3,320,69,256,150,256S297.1,320,300,400Z"
              transform="translate(-0.07 -46.46)"/>
        <polygon className="cls-1"
                 points="182.54 170.59 149.97 170.59 117.39 170.59 103.83 226.38 149.97 226.38 196.1 226.38 182.54 170.59"/>
        <ellipse className="cls-1" cx="149.96" cy="93.88" rx="81.54" ry="93.88"/>
        <ellipse className="cls-1" cx="68.43" cy="102.24" rx="20.38" ry="25.48"/>
        <ellipse className="cls-1" cx="231.5" cy="102.24" rx="20.38" ry="25.48"/>
    </svg>
)

const FaceDetectionAntiSpoofing = () => {
    // const camera = useRef();
    // const cameraCanvas = useRef();

    // const [enqueue_notification, set_enqueue_notification] = useState(true)
    // const [face_detected, set_face_as_detected] = useState(false)


    const { enqueueSnackbar } = useSnackbar();
    // const dispatch = useDispatch()

    let model, classifier, ctx, videoWidth, videoHeight, video, videoCrop, canvas, label;
    let cmp=0;
    let windows=15;
    let decision=[];

    function ArrayAvg(myArray) {
        let i = 0, sum = 0, ArrayLen = myArray.length;

        while (i < ArrayLen) {
            sum = sum + myArray[i++];
        }
        return sum / ArrayLen;
    }

    //run camera
    async function setupCamera() {
        video = document.getElementById('video');
        video.srcObject = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': { facingMode: 'user' },
        });

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    }

    //cropped the face detected
    function getImage(video, sizeImg, startImg){
        const canvasTemp = document.createElement('canvas');
        canvasTemp.height = sizeImg;
        canvasTemp.width = sizeImg;

        const ctxTemp = canvasTemp.getContext("2d");
        ctxTemp.clearRect(0, 0, sizeImg, sizeImg); // clear canvas
        ctxTemp.drawImage(video, startImg[0], startImg[1], sizeImg, sizeImg, 0, 0, sizeImg, sizeImg);
        return canvasTemp;
    }


    const renderPrediction = async () => {
        const font = "24px sans-serif";
        ctx.font = font;

        const returnTensors = false;
        const flipHorizontal = true;
        const annotateBoxes = true;
        const classifySpoof = true;

        const predictions = await model.estimateFaces(
            video, returnTensors, flipHorizontal, annotateBoxes);

        if (predictions.length===1) {
            // set_face_as_detected(true)
            // set_as_spoof(true)
            cmp++
            const start = predictions[0].topLeft;
            const end = predictions[0].bottomRight;

            const bbx_bottom_right_y = predictions[0].bottomRight[1]
            const bbx_top_left_x = predictions[0].topLeft[0]

            const size = [end[0] - start[0], end[1] - start[1]];


            const mid = [(start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5]

            // create a Square bounding box

            const scale = 1.1
            const sizeNew = Math.max(size[0], size[1]) * scale
            const startNew = [mid[0] - (sizeNew * 0.5), mid[1] - (sizeNew * 0.5)]



            // Perform spoof classification (UNFINISHED!)
            if (classifySpoof){
                // Cropping the frame and perform spoof classification
                videoCrop = getImage(video, sizeNew, startNew);

                // If the past can be done easily int the manner in the best can be done
                // Predictions
                const logits = tf.tidy(() => {
                    const normalizationConstant = 1.0 / 255.0;

                    let tensor = tf.browser.fromPixels(videoCrop, 3)
                        .resizeBilinear([224, 224], false)
                        .expandDims(0)
                        .toFloat()
                        .mul(normalizationConstant)
                    // console.log('predict', classifier.predict(tensor))
                    return classifier.predict(tensor);
                    }
                );


                const labelPredict = await logits.data();

                if(cmp<=windows){
                    // console.log('labelPrediction: ', labelPredict[0])
                    decision.push(labelPredict[0]);

                    if(decision.length===windows){
                        // console.log("15 frame" + labelPredict[0])
                        ctx.lineWidth = "2";
                        if(bbx_top_left_x > 360 && bbx_top_left_x < 480 && bbx_bottom_right_y > 280 && bbx_bottom_right_y < 400){
                            // console.log("bbx_bottom_right_y: ", bbx_bottom_right_y)
                            // console.log("bbx_top_left_x: ", bbx_top_left_x)

                            if( ArrayAvg(decision) < 0.8 ){
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                // console.log(ArrayAvg(decision))
                                label=`Real `+ `(` + ArrayAvg(decision).toFixed(2) + `)`;

                                // Rendering the bounding box
                                ctx.strokeStyle="green";
                                ctx.fillStyle = "rgb(10,236,40)";
                                ctx.strokeRect(startNew[0], startNew[1], sizeNew, sizeNew);
                                // console.log(startNew[0], startNew[1])
                                // console.log(label)

                                // Drawing the label
                                const textWidth = ctx.measureText(label).width;
                                const textHeight = parseInt(font, 10); // base 10
                                ctx.fillRect(startNew[0], startNew[1]-textHeight - 5, textWidth + 4, textHeight + 2);
                                ctx.fillStyle = "#ffffff";
                                ctx.fillText(label, startNew[0], startNew[1] - 6);
                                // set_as_spoof(false)
                                // dispatch(setAsReal())
                            }

                            else{
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                label='Spoof ' + `(` + ArrayAvg(decision).toFixed(2) + `)`;
                                ctx.fillStyle = "rgb(208,25,25)";
                                // Rendering the bounding box
                                ctx.strokeStyle="red";
                                ctx.strokeRect(startNew[0], startNew[1], sizeNew, sizeNew);
                                // console.log(startNew[0], startNew[1])
                                //  console.log(label)

                                // Drawing the label
                                const textWidth = ctx.measureText(label).width;
                                const textHeight = parseInt(font, 10); // base 10
                                ctx.fillRect(startNew[0], startNew[1]-textHeight - 5, textWidth + 4, textHeight + 4);
                                ctx.fillStyle = "#ffffff";
                                ctx.fillText(label, startNew[0], startNew[1] - 6);

                                // set_as_spoof(true)
                                // dispatch(setAsSpoof())
                            }
                        }
                        else{
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }


                        cmp=0;
                        decision=[];
                    }
                }
            }
        }

        else{
            cmp=0;
            decision=[];
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        //like setInterval()
        requestAnimationFrame(renderPrediction);

    };

    const setupPage = async () => {

        await setupCamera();
        video.play();

        videoWidth = video.videoWidth;
        videoHeight = video.videoHeight;
        video.width = videoWidth;
        video.height = videoHeight;

        // canvas
        canvas = document.getElementById('output');
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        ctx = canvas.getContext('2d');

        //face detection
        model = await blazeface.load();

        // Load classifier from static storage
        //classifier = await tf.loadGraphModel('model-graph-f16/anti-spoofing.json');
        classifier = await tf.loadLayersModel('./rose_model/model.json');

        // classifier.summary();
        // await renderPrediction();
    };

    // useEffect(()=>{
    //     setupPage().then(()=>{
    //         enqueueSnackbar('Performing anti-spoofing task...', { variant: 'success' })
    //     })
    // })

    useEffect(()=>{
        setupPage().then(()=>{
            enqueueSnackbar('Setting up environment...', { variant: 'success' })
        })
    })
    const performTask = ( ()=>{
        setupPage().then(async()=>{
            enqueueSnackbar('Performing anti-spoofing task...', { variant: 'success' })
            await renderPrediction();
        })
    })

    return(
        <div className={'container'}>
            {/*{face_detected ? <div className={'results'}>*/}
            {/*    <div>Face detected is : </div>*/}
            {/*    {is_spoof ?*/}
            {/*        <div className={'label label-spoof'}> spoof </div>*/}
            {/*        :*/}
            {/*        <div className={'label label-real'}> real </div>}*/}
            {/*</div>: <></>}*/}


            {/*{avatar()}*/}

            <div className={'row'}>
                <div className={'column'}>
                    <div id="main">
                        <div className="overlay-container">
                            {svgIcon()}
                        </div>
                        <video preload="none" id="video" playsInline/>
                        <canvas id="output"/>

                    </div>
                    <Button variant="contained" color="success" onClick={()=> performTask()}>
                        Perform anti-spoofing task
                    </Button>
                </div>

                <div className={'column'}>
                    <div className={'row'}>
                    <img src={avatarpng} alt={'avatar'}/>
                    <img src={avatarpng} alt={'avatar'}/>
                    </div>
                </div>

            </div>
        </div>

        // <div className="camera__wrapper">
        //     <Webcam audio={false} className={'video'} ref={camera} width="100%" height="auto" />
        //     <canvas className={classnames('output webcam-overlay', 'webcam-overlay--hidden')} ref={cameraCanvas} />
        // </div>
    )
}

export default FaceDetectionAntiSpoofing
