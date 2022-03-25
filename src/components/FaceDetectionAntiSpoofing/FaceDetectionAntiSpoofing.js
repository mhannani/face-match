import React, {useEffect, useRef, useState} from 'react'
// import setupPage from '../../helpers/anti-spoofing'
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import './face_detection_anti_spoofing.css'
// import avatarpng from '../../assets/avatar.png'
// import Webcam from "react-webcam";
// import classnames from "classnames";
// import {setAsReal, setAsSpoof, reset} from "../../store/faceSlice";
// import {renderPrediction, setDimension, setupPage} from '../../helpers/anti-spoofing'
import {useDispatch, useSelector} from "react-redux";
import {Alert, AlertTitle, Button, TextField } from "@mui/material";
import {useSnackbar} from "notistack";

// import {round} from "@tensorflow/tfjs";

const svgIcon = () => (
    <svg
        width="100%"
        height="100%"
        className="ellipse"
        viewBox="0 0 260 200"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        xmlnsXlink="http://www.w3.org/1999/xlink">
        <defs>
            <mask id="overlay-mask" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="#fff" className={'rect'}/>
                <ellipse id="ellipse-mask" cx="50%" cy="50%" rx="50" ry="70" />
            </mask>
        </defs>

        <rect x="0" y="0" width="100%" height="100%" mask="url(#overlay-mask)" fillOpacity="0.7"/>
    </svg>
);

let model, classifier, ctx, videoWidth, videoHeight, video, videoCrop, canvas, label;
let cmp=0;
// let windows=15;
let decision=[];

const FaceDetectionAntiSpoofing = () => {
    // const camera = useRef();
    // const cameraCanvas = useRef();

    // const [enqueue_notification, set_enqueue_notification] = useState(true)
    // const [face_detected, set_face_as_detected] = useState(false)
    // const dispatch = useDispatch()
    // const do_liveness = useSelector((state) => state.face.do_liveness)
    // const [as_threshold, setThreshold] = React.useState(0.8);
    // const [threshold, setThreshold] = React.useState(0.8);
    const [windows, setWindows] = React.useState(15);
    const [is_running, set_is_running] = React.useState(false)
    const [is_ready_to_spoofing_task, set_is_ready_to_spoofing_task] = React.useState(false)

    const [thresholdValue, setThresholdValue] = React.useState(0.8)
    const { enqueueSnackbar } = useSnackbar();
    // const dispatch = useDispatch()

    function ArrayAvg(myArray) {
        let i = 0, sum = 0, ArrayLen = myArray.length;

        while (i < ArrayLen) {
            sum = sum + myArray[i++];
        }
        return sum / ArrayLen;
    }

    //Run camera
    async function setupCamera() {
        video = document.getElementById('video');
        video.srcObject = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': {
                facingMode: 'user',
                width: {exact: 640},
                height: {ideal: 480},
                // deviceId: {exact: 'b25a6018bdb675995f90e11cd6983f89255cb55e0bcd5c91d1c04a5590f225b2'}
            },
        });

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    }

    //cropped the face detected
    function getImage(video, sizeImg, startImg) {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.height = sizeImg;
        canvasTemp.width = sizeImg;

        const ctxTemp = canvasTemp.getContext("2d");
        ctxTemp.clearRect(0, 0, sizeImg, sizeImg); // clear canvas
        ctxTemp.drawImage(video, startImg[0], startImg[1], sizeImg, sizeImg, 0, 0, sizeImg, sizeImg);
        return canvasTemp;
    }

    const renderPrediction = async () => {
        const font = "18px sans-serif";
        ctx.font = font;

        // console.log('windows, thresholdValue: ', windows, thresholdValue)
        const returnTensors = false;
        const flipHorizontal = true;
        const annotateBoxes = true;
        const classifySpoof = true;

        const predictions = await model.estimateFaces(
            video, returnTensors, flipHorizontal, annotateBoxes);

        // console.log('threshold 1: ', thresholdValue)
        if (predictions.length===1) {
            console.log('one face detected')
            // set_face_as_detected(true)
            // set_as_spoof(true)
            cmp++
            const start = predictions[0].topLeft;
            const end = predictions[0].bottomRight;

            const bbx_bottom_right_y = predictions[0].bottomRight[1]
            const bbx_top_left_x = predictions[0].topLeft[0]

            const size = [end[0] - start[0], end[1] - start[1]];
            // decision = []

            const mid = [(start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5]

            const bbx_w = start[0] - end[0]
            // create a Square bounding box


            const scale = 1.1
            const sizeNew = Math.max(size[0], size[1]) * scale
            const startNew = [mid[0] - (sizeNew * 0.5), mid[1] - (sizeNew * 0.5)]
            // console.log('threshold 2: ', thresholdValue)

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
                // console.log('threshold 3: ', thresholdValue)
                // console.log('window: ', window)
                const labelPredict = await logits.data();

                console.log('windows / cmp: ', windows, cmp)

                if(cmp <= windows){
                    console.log('labelPrediction: ', labelPredict[0])
                    decision.push(labelPredict[0]);
                    // console.log('threshold 3.9: ================================================', thresholdValue)
                    console.log('===> decision.length, windows: ', decision.length, windows)
                    if(decision.length===windows){

                        // console.log("15 frame" + labelPredict[0])
                        ctx.lineWidth = "2";
                        // console.log('threshold 4: ================================================', thresholdValue)
                        console.log("bbx_bottom_right_y: ", bbx_bottom_right_y)
                        console.log("bbx_top_left_x: ", bbx_top_left_x)
                        if( bbx_top_left_x > 460 && bbx_top_left_x < 600 && bbx_bottom_right_y > 280 && bbx_bottom_right_y < 400 ) {
                            console.log("bbx_bottom_right_y: ", bbx_bottom_right_y)
                            console.log("bbx_top_left_x: ", bbx_top_left_x)
                            console.log('face within the ellipse')

                            if (bbx_w > 180) {
                                console.log('face near to the camera')
                                if (ArrayAvg(decision) < thresholdValue) {
                                    console.log('real')

                                    // console.log(threshold, window)
                                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                                    // console.log(ArrayAvg(decision))
                                    label = `Real ` + `(` + ArrayAvg(decision).toFixed(2) + `)`;

                                    // Rendering the bounding box
                                    ctx.strokeStyle = "green";
                                    ctx.fillStyle = "rgb(10,236,40)";
                                    ctx.strokeRect(startNew[0], startNew[1], sizeNew, sizeNew);
                                    // console.log(startNew[0], startNew[1])
                                    // console.log(label)

                                    // Drawing the label
                                    const textWidth = ctx.measureText(label).width;
                                    const textHeight = parseInt(font, 10); // base 10
                                    ctx.fillRect(startNew[0], startNew[1] - textHeight - 5, textWidth + 4, textHeight + 2);
                                    ctx.fillStyle = "#ffffff";
                                    ctx.fillText(label, startNew[0], startNew[1] - 6);
                                    // set_as_spoof(false)
                                    // dispatch(setAsReal())
                                }
                                else {
                                    console.log('spoof')
                                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                                    label = 'Spoof ' + `(` + ArrayAvg(decision).toFixed(2) + `)`;
                                    ctx.fillStyle = "rgb(208,25,25)";
                                    // Rendering the bounding box
                                    ctx.strokeStyle = "red";
                                    ctx.strokeRect(startNew[0], startNew[1], sizeNew, sizeNew);
                                    // console.log(startNew[0], startNew[1])
                                    //  console.log(label)

                                    // Drawing the label
                                    const textWidth = ctx.measureText(label).width;
                                    const textHeight = parseInt(font, 10); // base 10
                                    ctx.fillRect(startNew[0], startNew[1] - textHeight - 5, textWidth + 4, textHeight + 4);
                                    ctx.fillStyle = "#ffffff";
                                    ctx.fillText(label, startNew[0], startNew[1] - 6);

                                    // set_as_spoof(true)
                                    // dispatch(setAsSpoof())
                                }
                                // cmp=0;
                                decision=[];
                            }

                            else {
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                enqueueSnackbar('Please be close to the camera... ', { variant: 'success' })
                                decision=[];
                            }
                        }

                        else {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            enqueueSnackbar('Your face should be in the ellipse ', { variant: 'success' })
                            decision=[];
                        }

                        cmp=0;
                        decision=[];
                    }
                }

                else{
                    cmp=0
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
        // cmp=0;
        // decision=[];
        requestAnimationFrame(renderPrediction);
        // console.log('threshold 6: ', thresholdValue)
        // cmp=0;

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
        classifier = await tf.loadLayersModel('./rose_model/model.json');

        // classifier.summary();
        // await renderPrediction();
    };

    useEffect( () => {
        setupPage().then(() => {
            enqueueSnackbar('Setting up environment...', { variant: 'success' })
        })

        set_is_ready_to_spoofing_task(true)
        console.log(is_ready_to_spoofing_task)
        // return ()=>{console.log('unmounted')}
    },[is_ready_to_spoofing_task])

    const performTask = (() => {
        setupPage().then(async() => {
            enqueueSnackbar('Performing anti-spoofing task...', { variant: 'info' })
            await renderPrediction();
        })
    })

    // const take_selfies = (() => {
    //     console.log('taking screen shots')
    // })

    const capture = () => {
        // const imgSrc = camera.current.getScreenshot();
        // const newPhotos = [...photos, imgSrc];
        // setPhotos(newPhotos);
        // setPhoto(imgSrc);
        // setShowGallery(true);
    };


    const handleThresholdChange = async (event) => {
        const { name, value } = event.target;

        setThresholdValue(value);
        setupCamera()
        // setupPage()
        // event.persist()
    };

    const handleWindowChange = async (event) => {
        const { name, value } = event.target;

        setWindows(value);
        setupCamera()
        // setupPage()
        // event.persist()
    };

    const perform_anti_spoofing = async (event) => {

        event.preventDefault();
        // console.log("event: ", thresholdValue, window)
        // console.log('perform')

        setupPage().then( async() => {
            set_is_running(true)
            enqueueSnackbar('Performing anti-spoofing task...', { variant: 'info' })
            await renderPrediction();
        })
    }

    const refreshPage = () => {
        console.log('window: ', window)
        window.location.reload(false);
    }

    return(
        <div className={'container'}>
            <div className={'row'}>
                <div className={'column'}>
                    <div id="main">
                        <div className="overlay-container">
                            {svgIcon()}
                        </div>
                        <video preload="none" id="video" playsInline/>
                        <canvas id="output"/>
                    </div>
                    <div>+ <code>Threshold</code>: proba > threshold => spoof : <b>{thresholdValue}</b></div>
                    <div>+ <code>Window</code> (number of frames to take in order to make decision): <b>{windows}</b></div>

                    {is_ready_to_spoofing_task ? <div className={'actions'}>

                        {/*<Button variant="contained" color="success"*/}
                        {/*        sx={ { borderRadius: 0 }}*/}
                        {/*        onClick={()=> performTask()}*/}
                        {/*>*/}
                        {/*    Perform anti-spoofing task*/}
                        {/*</Button>*/}
                        <form onSubmit={perform_anti_spoofing}>
                            {
                                is_running ? <TextField
                                    hiddenLabel
                                    id="threshold"
                                    defaultValue={thresholdValue}
                                    variant="filled"
                                    size="small"
                                    onChange={handleThresholdChange}
                                    disabled
                                /> : <TextField
                                    hiddenLabel
                                    id="threshold"
                                    defaultValue={thresholdValue}
                                    variant="filled"
                                    size="small"
                                    onChange={handleThresholdChange}
                                />
                            }

                            {
                                is_running ? <TextField
                                    hiddenLabel
                                    id="windows"
                                    defaultValue={windows}
                                    variant="filled"
                                    size="small"
                                    onChange={handleWindowChange}
                                    disabled
                                />
                                    :
                                    <TextField
                                        hiddenLabel
                                        id="windows"
                                        defaultValue={windows}
                                        variant="filled"
                                        size="small"
                                        onChange={handleWindowChange}
                                    />
                            }

                            <Button variant="contained" color="success"
                                                  sx={ { borderRadius: 0 }}
                                                  type="submit"
                                                  disabled={is_running}
                            >
                                Perform anti-spoofing task

                            </Button>

                            <Button variant="contained" color="warning"
                                    sx={ { borderRadius: 0 }}
                                    onClick={refreshPage}
                                    disabled={!is_running}
                            >
                                Stop task

                            </Button>
                            {/*<button>Submit</button>*/}
                        </form>
                    </div>: <div>waiting...</div>}
                </div>
            </div>
        </div>
    )
}

export default FaceDetectionAntiSpoofing
