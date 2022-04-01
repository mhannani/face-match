import React, {useEffect, useRef, useState} from 'react'
// import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import './face_detection_anti_spoofing.css'
import avatar from '../../assets/avatar.png'
import {ArrayAvg, svgIcon} from "../../helpers/anti-spoofing";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import {make_requests} from "../../helpers/api";
import Confetti from '../Confetti/Confetti'
import SyncLoader from "react-spinners/SyncLoader";
import { BrowserView, MobileView } from 'react-device-detect';
import { Human } from '@vladmandic/human/dist/human.esm';
import { Online } from "react-detect-offline"
import {refreshPage} from "../../helpers/anti-spoofing";
import {human_config} from "../../helpers/human";
import {MobileViewComponent} from "../MobileViewComponent/MobileViewComponent";
// components
import {OfflineComponent} from '../OfflineComponent/OfflineComponent'
import {
    Button,
    Paper,
    Slider,
    styled,
    Tooltip
} from "@mui/material";

import {useSnackbar} from "notistack";
import {useDispatch, useSelector} from "react-redux";

// redux toolkit actions
import {setWindows, setThreshold} from "../../store/ParametersSlice";
import {setIsRunning, setIsLoading} from "../../store/AppSlice"
import {Parameters} from "../Parameters/Parameters";

const human = new Human(human_config);


let model, classifier, ctx, videoWidth, videoHeight, video, videoCrop, canvas, label, left_min, left_max, top_min, top_max, canvas_ratio;
let cmp=0;
// let windows=15;
let decision=[];
let oldfaceDet=0;

let ellipsewarningCounter=0;
let headSizeewarningCounter=0;

const maxAttempt=2;
let attemptCount=0;

const FaceDetectionAntiSpoofing = () => {

    // control variables
    // -----------------
    // The window parameter
    const windows = useSelector((state) => state.parameters.windows)

    // The threshold parameter
    const threshold = useSelector((state) => state.parameters.threshold)

    // App state
    // ----------
    // tracks when application's job is running
    // const [is_running, set_is_running] = useState(false)
    const is_running = useSelector((state) => state.app.is_running)

    // tracks when the application is loading
    const [app_loading, set_app_as_loading] = useState(false)


    // screenshots state
    // -----------------
    // Track when the selfie is taken
    const [selfie_1, set_selfie_1] = useState(null)

    // api state
    // ---------
    // tells if the request has sent to the api
    const [request_sent, set_request_as_sent] = useState(false)
    // holds the api response[object/json]
    const [api_response, set_api_response] = useState(null)
    // holds the error message if there
    const [api_error, set_api_error] = useState(null)

    // confetti state
    // show confetti animation when predicting faces as `real`
    const [conf_is_running, set_conf_as_running] = useState(false)

    // snack bar hock
    const { enqueueSnackbar } = useSnackbar();

    const dispatch = useDispatch()

    //Run camera
    async function setupCamera() {
        video = document.getElementById('video');
        video.srcObject = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': {
                facingMode: 'user',
                // width: {ideal: 640},
                // height: {ideal: 480},

                width: { ideal: 960, max:1200},
                height: { ideal: 720, max:1200},
                //deviceId: {exact: 'b25a6018bdb675995f90e11cd6983f89255cb55e0bcd5c91d1c04a5590f225b2'}
            },
        })

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    }

    //cropped the face detected
    function getImage(video, sizeImg, startImg) {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.height = sizeImg[1];
        canvasTemp.width = sizeImg[0];

        const ctxTemp = canvasTemp.getContext("2d");
        //ctxTemp.clearRect(0, 0, sizeImg[0], sizeImg[1]); // clear canvas
        ctxTemp.drawImage(video, startImg[0], startImg[1], sizeImg[0], sizeImg[1], 0, 0, sizeImg[0], sizeImg[1]);
        return canvasTemp;
    }

    function getFrame(video){
        const canvas_frame = document.createElement('canvas');
        canvas_frame.width = video.videoWidth;
        canvas_frame.height = video.videoHeight;

        const ctx = canvas_frame.getContext('2d')
        ctx.drawImage(video,0,0);
        return canvas_frame;
    }

    let renderPrediction = async () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (attemptCount > maxAttempt)
        {
            console.log('stopping when 5 attempts was spoof by local model! ')
            const requestOptions = make_requests()
            // console.log('================================================')
            fetch("https://skyanalytics.indatacore.com:4431/check_liveness", requestOptions)
                .then(response => response.json())
                .then(result => {
                    set_request_as_sent(true);
                    if(result.status_code !== '500'){
                        set_api_response(result.response_data);
                    }

                    else{
                        set_api_response(null)
                        set_api_error(result.status_label)

                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // showing confetti
                    if(result.response_data.face_class==='Real'){
                        set_conf_as_running(true);
                        setTimeout(() => {
                            set_conf_as_running(false);
                        }, 3000);
                    }

                    dispatch(setIsRunning(false));
                    // set_app_as_loading(true)
                })

                .catch(error => console.log('error', error));
            set_request_as_sent(true)
            capture = () => {}
            set_api_response(null)
            set_api_error(null)
            return 0;
        }

        const font = "18px sans-serif";
        ctx.font = font;
        let myframe=getFrame(video);
        //await capture(myframe,  1)
        // console.log('windows, thresholdValue: ', windows, thresholdValue)
        const returnTensors = false;
        const flipHorizontal = false;
        const annotateBoxes = true;
        const classifySpoof = true;

        // [x, y, width, height]
        const predictions = await human.detect(myframe); // run detection
        let score = 0;

        if (predictions.face.length===1 && predictions.face[0].score>0.8) {
            const faceBox=predictions.face[0].box;
            const faceScore=predictions.face[0].score



            const start = [faceBox[0],faceBox[1]].map(function(x) { return x * canvas_ratio; });


            const bbx_w = faceBox[2]

            const bbx_bottom_right_y = faceBox[1]+faceBox[3]
            const bbx_top_left_x = faceBox[0]

            const size = [faceBox[2], faceBox[3]].map(function(x) { return x * canvas_ratio; });


            const video_start = [faceBox[0],faceBox[1]];

            const video_size = [faceBox[2], faceBox[3]];

            // decision = []

            //const mid = [(start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5]


            // create a Square bounding box

            //const scale = 1.1
            //const sizeNew = Math.max(size[0], size[1]) * scale
            //const startNew = [mid[0] - (sizeNew * 0.5), mid[1] - (sizeNew * 0.5)]
            // console.log('threshold 2: ', thresholdValue)

            if (bbx_top_left_x > left_min && bbx_top_left_x < left_max && bbx_bottom_right_y > top_min && bbx_bottom_right_y < top_max) {
                ellipsewarningCounter=0;
                if (bbx_w > 180) {
                    // ------------------------------------- Face detected

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    label = `FACE ` + `(` + ArrayAvg(decision).toFixed(2) + `)`;

                    // Rendering the bounding box
                    ctx.strokeStyle = "blue";
                    ctx.fillStyle = "rgb(10,236,40)";
                    ctx.strokeRect(start[0], start[1], size[0], size[1]);
                    const textWidth = ctx.measureText(label).width;
                    const textHeight = parseInt(font, 10); // base 10
                    ctx.fillRect(start[0], start[1] - textHeight - 5, textWidth + 4, textHeight + 2);
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText(label, start[0], start[1] - 6);

                    // ---------------------------------------------------------
                    headSizeewarningCounter=0;
                    cmp++
                    if (classifySpoof) {
                        videoCrop = getImage(myframe, video_size, video_start);
                        //await capture(videoCrop, 1)
                        // check antispoofing
                        const logits = tf.tidy(() => {
                                const normalizationConstant = 1.0 / 255.0;

                                let tensor = tf.browser.fromPixels(videoCrop, 3)
                                    .resizeBilinear([32, 32], false)
                                    .expandDims(0)
                                    .toFloat()
                                    .mul(normalizationConstant)
                                // console.log('predict', classifier.predict(tensor))
                                return classifier.predict(tensor);
                            }
                        );
                        const labelPredict = await logits.data();
                        console.log("labelPredict ",labelPredict)
                        decision.push(labelPredict[1]);
                        if (oldfaceDet < labelPredict[1]) {
                            oldfaceDet = labelPredict[1];
                            await capture(myframe)
                        }
                        if (decision.length === windows) {
                            console.log('incrementing attemptCount')
                            attemptCount++
                            const meanProb = ArrayAvg(decision);
                            if (meanProb > threshold) { // real
                                // set_selfie_1_as_taken(true)
                                console.log('===============> detected as real <=================')
                                // await capture(videoCrop, 2)  // to be removed
                                // --------------------------------------------------------

                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                label = `Real ` + `(` + ArrayAvg(decision).toFixed(2) + `)`;

                                // Rendering the bounding box
                                ctx.strokeStyle = "green";
                                ctx.fillStyle = "rgb(10,236,40)";
                                ctx.strokeRect(start[0], start[1], size[0], size[1]);
                                const textWidth = ctx.measureText(label).width;
                                const textHeight = parseInt(font, 10); // base 10
                                ctx.fillRect(start[0], start[1] - textHeight - 5, textWidth + 4, textHeight + 2);
                                ctx.fillStyle = "#ffffff";
                                ctx.fillText(label, start[0], start[1] - 6);
                                // ---------------------------------------------------------
                                const requestOptions = make_requests()
                                // console.log('================================================')
                                fetch("https://skyanalytics.indatacore.com:4431/check_liveness", requestOptions)
                                    .then(response => response.json())
                                    .then(result => {
                                        set_request_as_sent(true);
                                        if(result.status_code !== '500'){
                                            set_api_response(result.response_data);
                                        }

                                        else{
                                            set_api_response(null)
                                            set_api_error(result.status_label)

                                        }



                                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                                        console.log(result)


                                        // showing confetti
                                        if(result.response_data.face_class==='Real'){
                                            set_conf_as_running(true);
                                            setTimeout(() => {
                                                set_conf_as_running(false);
                                            }, 3000);
                                        }
                                        dispatch(setIsRunning(false))
                                        // set_app_as_loading(true)

                                    })

                                    .catch(error => console.log('error', error));
                                set_request_as_sent(true)
                                capture = () => {}
                                set_api_response(null)
                                set_api_error(null)
                                return 0;

                            } else {  // spoof
                                // --------------------------------------------------------
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                label = `Spoof ` + `(` + ArrayAvg(decision).toFixed(2) + `)`;
                                // Rendering the bounding box
                                ctx.strokeStyle = "red";
                                // ctx.fillStyle = "rgb(10,236,40)";
                                // ctx.strokeRect(start[0], start[1], size[0], size[1]);
                                const textWidth = ctx.measureText(label).width;
                                const textHeight = parseInt(font, 10); // base 10
                                ctx.fillRect(start[0], start[1] - textHeight - 5, textWidth + 4, textHeight + 2);
                                ctx.fillStyle = "#ffffff";
                                ctx.fillText(label, start[0], start[1] - 6);
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                // ---------------------------------------------------------
                            }
                            decision = []
                            oldfaceDet = 1
                            cmp = 0
                        }
                    }
                } else { // image size
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    headSizeewarningCounter++
                    if(headSizeewarningCounter>25)
                    {
                        headSizeewarningCounter=0
                        enqueueSnackbar('Please be close to the camera... ', { variant: 'warning' })
                    }
                }

            }else{ // image ellipse
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ellipsewarningCounter++
                if(ellipsewarningCounter>25)
                {
                    ellipsewarningCounter=0
                    enqueueSnackbar('Your face should be straight / within the ellipse ', { variant: 'warning' })
                }
            }
        }

        if(!request_sent){
            requestAnimationFrame(renderPrediction);
        }

        else{
            return 0;
        }

    };

    const setupPage = async () => {
        await setupCamera();
        video.play();

        videoWidth = 640;
        videoHeight = 480;
        video.width = videoWidth;
        video.height = videoHeight;

        canvas_ratio=videoWidth/video.videoWidth;

        left_min=(video.videoWidth/3) - (video.videoWidth/10);
        left_max=2*(video.videoWidth/3) + (video.videoWidth/10);
        top_min=video.videoHeight/15;
        top_max=video.videoHeight-(video.videoHeight/20);

        // canvas
        canvas = document.getElementById('output');
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        //face detection
        //model = await blazeface.load();


        // const imgSrc = context.toDataURL('png')
        // console.log(imgSrc)

        // Load classifier from static storage
        // classifier = await tf.loadLayersModel('./rose_model/model.json');

        // classifier.summary();
        // await renderPrediction();
    };

    useEffect(  async () => {
        set_conf_as_running(false)
        set_app_as_loading(true)

        // Loading the classifier model
        classifier = await tf.loadLayersModel('./rose_model/model.json');

        setTimeout(()=>{
            set_app_as_loading(false)
        }, 3000)

        // setupPage().then(() => {
        //     enqueueSnackbar('Setting up environment...', { variant: 'success' })
        //     set_is_ready_to_spoofing_task(true)
        // })
    },[])

    let capture = async (canvas_img) => {
        let img_source = canvas_img.toDataURL();
        set_selfie_1(img_source)
    };


    const perform_anti_spoofing = async (event) => {
        cmp = 0
        set_api_response(null)
        event.preventDefault();
        // console.log("event: ", thresholdValue, window)
        // console.log('perform')
        dispatch(setIsRunning(true))
        setupPage().then( async() => {
            enqueueSnackbar('Performing Anti-spoofing task...', { variant: 'info' })
            await renderPrediction();
        })

    }

    return(
        <>
            <OfflineComponent/>
            <Online>
                <MobileViewComponent/>

                <BrowserView>
                    {
                        app_loading ?
                            <div className={'app_loader'}>
                                <SyncLoader size={18} />
                                <h4>Getting environment ready...</h4>
                            </div>:
                            <>

                                {conf_is_running && <Confetti is_run={conf_is_running}/>}
                                <div className={'container'}>
                                    <div className={'row'}>
                                        <div className={'column'}>

                                            <>
                                                <div id="main">
                                                    <div className="overlay-container">
                                                        { is_running && svgIcon()}
                                                    </div>
                                                    <video preload="none" id="video" playsInline/>
                                                    <canvas id="output"/>
                                                </div>
                                            </>

                                        </div>

                                        <div className={'column-right-side'}>
                                            <>
                                                {
                                                    api_error && <Paper key={1} elevation={4} className={'internal_error'}>
                                                        <h4>{api_error}</h4>
                                                    </Paper>
                                                }
                                                {
                                                    api_response && <Paper key={1} elevation={4} className={'api_result ' + (api_response.face_class==='Real' ? 'real':'spoof')}>
                                                        <h4>{api_response.face_class}</h4>
                                                        <p>{api_response.score}</p>
                                                    </Paper>
                                                }
                                            </>

                                            <div className={'row_avatar'}>
                                                <div className={'column_avatar'}>
                                                    <img className={'frame_1'} src={selfie_1 ? selfie_1 : avatar} alt={'avatar'}/>
                                                    <h6>SELFIE</h6>
                                                </div>
                                            </div>

                                            <Parameters/>

                                            <div className="row actions">
                                                { !request_sent ?
                                                    <Button color="success"
                                                            sx={{borderRadius: 0}}
                                                            disabled={is_running}
                                                            variant="contained"
                                                            onClick={perform_anti_spoofing}
                                                            startIcon={<PlayArrowIcon/>}
                                                    >
                                                        Run task
                                                    </Button>:
                                                    <Button color="success"
                                                            sx={{borderRadius: 0}}
                                                        // disabled={is_running}
                                                            variant="contained"
                                                            onClick={refreshPage}
                                                            startIcon={<PlayArrowIcon/>}
                                                    >
                                                        Try again
                                                    </Button>
                                                }
                                                <Button variant="contained" color="error"
                                                        sx={ { borderRadius: 0 }}
                                                        onClick={refreshPage}
                                                        disabled={!is_running}
                                                        startIcon={<StopIcon />}
                                                >
                                                    Stop task

                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </>
                    }
                </BrowserView>

            </Online>
        </>


    )
}

export default FaceDetectionAntiSpoofing
