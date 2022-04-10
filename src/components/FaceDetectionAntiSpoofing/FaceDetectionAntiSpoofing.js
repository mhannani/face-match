import React, {useEffect} from 'react'
import * as tf from '@tensorflow/tfjs';
import './face_detection_anti_spoofing.css'
import avatar from '../../assets/avatar.png'
import {ArrayAvg, refreshPage, svgIcon} from "../../helpers/anti-spoofing";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import {prepare_header_anti_spoofing, prepare_header_face_match} from "../../helpers/api";
import Confetti from '../Confetti/Confetti'
import {BrowserView} from 'react-device-detect';
import {Human} from '@vladmandic/human/dist/human.esm';
import {Online} from "react-detect-offline"
import {human_config} from "../../helpers/human";
import {MobileViewComponent} from "../MobileViewComponent/MobileViewComponent";
import {Button, Paper} from "@mui/material";
import {useSnackbar} from "notistack";
import {useDispatch, useSelector} from "react-redux";
import ReplayIcon from '@mui/icons-material/Replay';

// Helpers
import {getImage, setupCamera} from "../../helpers/camera";

// Components
import {OfflineComponent} from '../OfflineComponent/OfflineComponent'
import Loading from "../Loading/Loading";
import {Parameters} from "../Parameters/Parameters";

// redux toolkit actions
import {setIsLoading, setIsRunning, setMessage} from "../../store/AppSlice"
import {setSelfie} from "../../store/screenshotsSlice";
import {setApiError, setApiResponse, setRequestSent} from "../../store/apiSlice";
import {
    setFaceMatchApiError,
    setFaceMatchApiResponse,
    setFaceMatchRequestSent,
    setSimilarity,
    setSkyFaceMatchDecisionLabel
} from "../../store/faceMatchSlice";
import {setShowConfetti} from "../../store/confettiSlice";
import {LoadingButton} from "@mui/lab";

let human, classifier, ctx, videoWidth, videoHeight, video, videoCrop;
let canvas, label, left_min, left_max, top_min, top_max, canvas_ratio;
let cmp=0;
let decision=[];
let oldfaceDet=0;

let ellipsewarningCounter=0;
let one_face_warningCounter = 0
let headSizeewarningCounter=0;

let maxAttempt=2;
let attemptCount=0;

const FaceDetectionAntiSpoofing = () => {

    // control variables
    const windows = useSelector((state) => state.parameters.windows)
    const threshold = useSelector((state) => state.parameters.threshold)

    // App state
    const is_running = useSelector((state) => state.app.is_running)
    const is_loading = useSelector((state) => state.app.is_loading)
    const message = useSelector((state) => state.app.message)

    // screenshots state
    const selfie = useSelector((state)=> state.screenshots.selfie_uri)

    // anti-spoofing api state
    const request_sent = useSelector((state) => state.api.request_sent)
    const api_response = useSelector((state) => state.api.api_response)
    const api_error = useSelector((state) => state.api.api_error)

    // face match api state
    const face_match_request_sent = useSelector((state) => state.face_match_api.face_match_request_sent)
    const face_match_api_response = useSelector((state) => state.face_match_api.face_match_api_response)
    const face_match_api_error = useSelector((state) => state.face_match_api.face_match_api_error)
    const similarity = useSelector((state) => state.face_match_api.similarity)
    const sky_face_match_decision_label = useSelector((state) => state.face_match_api.sky_face_match_decision_label)

    // confetti state
    const conf_is_running = useSelector((state) => state.confetti.show_confetti)

    // ID card
    const uploaded_file = useSelector((state) => state.upload.uploaded_file)

    // Guid
    const guid = useSelector((state) => state.upload.guid)

    // snack bar hock
    const { enqueueSnackbar } = useSnackbar();

    const dispatch = useDispatch()

    function getFrame(video){
        const canvas_frame = document.createElement('canvas');
        canvas_frame.width = video.videoWidth;
        canvas_frame.height = video.videoHeight;

        const ctx = canvas_frame.getContext('2d')
        ctx.drawImage(video,0,0);
        return canvas_frame;
    }

    let renderPrediction = async () => {
        console.log('begin render prediction function: ')
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // console.log('renderPrediction')
        ctx.font = "18px sans-serif";
        const font = "18px sans-serif";
        let my_frame = getFrame(video);
        const returnTensors = false;
        const flipHorizontal = false;
        const annotateBoxes = true;
        const classifySpoof = true;

        // [x, y, width, height]
        console.log('before human detect')
        const predictions = await human.detect(my_frame); // run detection
        console.log('after human detect')

        // await human.draw.hand(canvas, predictions.hand)
        let score = 0;

        // console.log('after predictions')
        // console.log('predictions: ', predictions)
        if (predictions.face.length===1 && predictions.face[0].score > 0.8) {
            console.log('if predictions.face.len  == 1')

            const faceBox = predictions.face[0].box;
            const faceScore = predictions.face[0].score
            const start = [faceBox[0],faceBox[1]].map(function(x) { return x * canvas_ratio; });
            const bbx_w = faceBox[2]
            const bbx_bottom_right_y = faceBox[1]+faceBox[3]
            const bbx_top_left_x = faceBox[0]
            const size = [faceBox[2], faceBox[3]].map(function(x) { return x * canvas_ratio; });
            const video_start = [faceBox[0],faceBox[1]];
            const video_size = [faceBox[2], faceBox[3]];

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // label = `FACE ` + `(` + ArrayAvg(decision).toFixed(2) + `)`;

            // Rendering the bounding box
            ctx.strokeStyle = "yellow";
            ctx.fillStyle = "rgb(10,236,40)";
            ctx.strokeRect(start[0], start[1], size[0], size[1]);

            if (bbx_top_left_x > left_min && bbx_top_left_x < left_max && bbx_bottom_right_y > top_min && bbx_bottom_right_y < top_max) {
                // console.log('bbox_top_left_x ...')
                ellipsewarningCounter=0;
                if (bbx_w > 190) {
                    headSizeewarningCounter=0;
                    cmp++
                    if (classifySpoof) {
                        videoCrop = getImage(my_frame, video_size, video_start);
                        // check anti-spoofing
                        const logits = tf.tidy(() => {
                                const normalizationConstant = 1.0 / 255.0;

                                let tensor = tf.browser.fromPixels(videoCrop, 3)
                                    .resizeBilinear([32, 32], false)
                                    .expandDims(0)
                                    .toFloat()
                                    .mul(normalizationConstant)
                                return classifier.predict(tensor);
                            }
                        );

                        const labelPredict = await logits.data();
                        decision.push(labelPredict[1]);

                        if (oldfaceDet < labelPredict[1]) {
                            oldfaceDet = labelPredict[1];
                            await capture(my_frame)
                        }

                        if (decision.length === windows) {
                            attemptCount++
                            const meanProb = ArrayAvg(decision);

                            if (meanProb > threshold) { // real

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

                                const requestOptions = prepare_header_anti_spoofing()
                                fetch("https://skyanalytics.indatacore.com:4431/check_liveness", requestOptions)
                                    .then(response => response.json())
                                    .then(result => {
                                        // set_request_as_sent(true);
                                        dispatch(setRequestSent(true))

                                        if(result.status_code !== '500'){
                                            dispatch(setApiResponse(result.response_data));
                                        }

                                        else{
                                            dispatch(setApiResponse(null));
                                            dispatch(setApiError(result.status_label))
                                            return 0;
                                        }

                                        // showing confetti
                                        if(result.response_data.face_class!=='Real'){
                                            const requestOptionsFaceMatch = prepare_header_face_match(guid)
                                            fetch("https://demo.skyidentification.com:7007/compare_multi_doc_vs_selfie", requestOptionsFaceMatch)
                                                .then(response => response.json())
                                                .then(result => {
                                                    // console.log(typeof result.status_code)
                                                    dispatch(setFaceMatchRequestSent(true))
                                                    if(result.status_code === '000'){
                                                        dispatch(setFaceMatchApiResponse(result.response_data));
                                                        // console.log(result.similarity);
                                                        // console.log(result.sky_face_match_decision_label);

                                                        dispatch(setSimilarity(result.similarity))
                                                        // console.log('response: ', result)
                                                        dispatch(setSkyFaceMatchDecisionLabel(result.sky_face_match_decision_label))

                                                        // dispatch(setShowConfetti(true))
                                                        // setTimeout(() => {
                                                        //     dispatch(setShowConfetti(false))
                                                        // }, 3000);

                                                    }
                                                    else{
                                                        dispatch(setFaceMatchApiResponse(null));
                                                        dispatch(setFaceMatchApiError(result.status_label))
                                                    }

                                                })
                                                .catch(error => console.log('error', error));
                                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                                            dispatch(setIsRunning(false));
                                            // dispatch(setRequestSent(true))
                                            // capture = () => {}
                                            // dispatch(setApiResponse(null));
                                            // dispatch(setFaceMatchRequestSent(false))
                                            // return 0;
                                        }

                                        dispatch(setIsRunning(false));
                                        // set_app_as_loading(true)
                                    })

                                    .catch(error => console.log('error', error));
                                // dispatch(setRequestSent(true))
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                // capture = () => {}
                                // dispatch(setApiResponse(null));
                                dispatch(setApiError(null))
                                dispatch(setIsRunning(false))
                                // dispatch(setRequestSent(true))
                                ctx.clearRect(0, 0, canvas.width, canvas.height);

                                // await capture(videoCrop, 2)  // to be removed
                                // --------------------------------------------------------


                                // return 0;
                            } else {  // spoof
                                // --------------------------------------------------------
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                label = `Spoof ` + `(` + ArrayAvg(decision).toFixed(2) + `)`;
                                // Rendering the bounding box
                                ctx.strokeStyle = "red";
                                ctx.fillStyle = "rgb(10,236,40)";
                                ctx.strokeRect(start[0], start[1], size[0], size[1]);
                                const textWidth = ctx.measureText(label).width;
                                const textHeight = parseInt(font, 10); // base 10
                                ctx.fillRect(start[0], start[1] - textHeight - 5, textWidth + 4, textHeight + 2);
                                ctx.fillStyle = "#ffffff";
                                ctx.fillText(label, start[0], start[1] - 6);
                                // ---------------------------------------------------------
                            }
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            decision = []
                            oldfaceDet = 1
                            cmp = 0
                            return 0;

                        }
                    }
                } else { // image size
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    headSizeewarningCounter++
                    if(headSizeewarningCounter>10)
                    {
                        headSizeewarningCounter=0
                        enqueueSnackbar('Please be close to the camera... ', { variant: 'warning' })
                    }
                }

            }else{ // image ellipse
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ellipsewarningCounter++
                if(ellipsewarningCounter>10)
                {
                    ellipsewarningCounter=0
                    enqueueSnackbar('Your face should be straight / within the ellipse ', { variant: 'warning' })
                }
            }
        }
        else if(predictions.face.length !==1){
            one_face_warningCounter++
            if(one_face_warningCounter > 10){
                one_face_warningCounter = 0
                // one face only supported
                enqueueSnackbar('One visible face only !', { variant: 'warning' })
            }
        }

        requestAnimationFrame(renderPrediction);
    };

    const setupPage = async () => {
        video = await setupCamera();
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
    };

    useEffect(async () => {
        dispatch(setShowConfetti(false))
        dispatch(setIsLoading(true))
        dispatch(setMessage('Setting up environment...'))

        // Loading the classifier model
        classifier = await tf.loadLayersModel('./rose_model/model.json');

        human = new Human(human_config);
        await human.detect(null); // run detection

        setTimeout(() => {
            dispatch(setIsLoading(false))
        }, 4000)

        setTimeout(()=>{
            dispatch(setMessage('Loading models...'))
        }, 1500)

        setTimeout(()=>{
            dispatch(setMessage('Ready !'))
        }, 3000)

    },[])

    let capture = async (canvas_img) => {
        let img_source = canvas_img.toDataURL();
        dispatch(setSelfie(img_source))
    };

    const perform_anti_spoofing = async (event) => {
        cmp = 0
        dispatch(setApiResponse(null));
        event.preventDefault();
        dispatch(setIsRunning(true))
        setupPage().then( async() => {
            enqueueSnackbar('Performing Anti-spoofing task...', { variant: 'info' })
            await renderPrediction();
        })
    }

    const re_perform_anti_spoofing = async (event) => {
        cmp=0;
        decision=[];
        oldfaceDet=0;

        ellipsewarningCounter=0;
        one_face_warningCounter = 0
        headSizeewarningCounter=0;

        maxAttempt=2;
        attemptCount=0;

        dispatch(setIsRunning(false))
        dispatch(setIsLoading(false))
        dispatch(setSelfie(null))
        dispatch(setRequestSent(false))
        dispatch(setApiResponse(null))
        dispatch(setApiError(null))
        dispatch(setApiResponse(null));
        dispatch(setFaceMatchRequestSent(false))
        dispatch(setFaceMatchApiResponse(false))
        dispatch(setFaceMatchApiError(false))


        event.preventDefault();
        dispatch(setIsRunning(true))
        setupPage().then( async() => {
            enqueueSnackbar('Re-performing Anti-spoofing task...', { variant: 'info' })
            await renderPrediction();
        })
    }

    return (
        <>
            <OfflineComponent/>
            <Online>
                <MobileViewComponent/>
                <BrowserView>
                    {
                        is_loading ?
                            <Loading message={message} variant={'sync'}/>:
                            <>
                                {conf_is_running && <Confetti is_run={conf_is_running}/>}
                                <div className={'container'}>
                                    <div className={'row'}>
                                        <div className={'column'}>
                                            <div id="main">
                                                <div className="overlay-container">
                                                    {!is_running && <code className={'attention'}>
                                                        <code className={'important'}>IMPORTANT:</code> Please change the threshold to a lower value...
                                                        Since the local model outputs always `spoof`, the request to both face match and anti-spoofing
                                                        APIs get sent only when detecting face as real by local model...
                                                        <br/>Example Threshold = 0.1. We set it up to 0.0 to neglect local model to see the liveness and face match apis outputs</code>}
                                                    {is_running && svgIcon()}
                                                </div>
                                                <video preload="none" id="video" playsInline/>
                                                <canvas id="output"/>
                                            </div>
                                        </div>

                                        <div className={'column-right-side'}>
                                            <div className="results">
                                                <div className="result-item">
                                                    {
                                                        api_error &&
                                                        <Paper key={1} elevation={4} className={'internal_error res_paper'}>
                                                            <h4>{api_error}</h4>
                                                        </Paper>
                                                    }
                                                    {
                                                        api_response &&
                                                        <Paper key={1} elevation={4} className={'api_result res_paper ' + (api_response.face_class==='Real' ? 'real':'spoof')}>
                                                            <h4>{api_response.face_class}</h4>
                                                            <p>{api_response.score}</p>
                                                        </Paper>
                                                    }
                                                </div>
                                                <div className="result-item">
                                                    {
                                                        face_match_api_error && <Paper key={1} elevation={4} className={'internal_error res_paper'}>
                                                            <h4>{face_match_api_error}</h4>
                                                        </Paper>
                                                    }
                                                    {
                                                        face_match_request_sent && <Paper key={1} elevation={4} className={'api_result res_paper ' + (similarity===0 ? 'spoof':'real')}>
                                                            <h4>Decision: {sky_face_match_decision_label}</h4>
                                                            <h4>Similarity: {similarity}</h4>
                                                        </Paper>
                                                    }
                                                </div>
                                            </div>


                                            <div className={'row_avatar'}>
                                                <div className={'column_avatar'}>
                                                    <img className={'frame_1'} src={selfie ? selfie : avatar} alt={'avatar'}/>
                                                    <h6>SELFIE</h6>
                                                </div>

                                                <div className={'column_avatar'}>
                                                    <img className={'uploaded_id_card'} src={uploaded_file} alt={'avatar'}/>
                                                    <h6>ID card</h6>
                                                </div>
                                            </div>

                                            <Parameters/>

                                            <div className="row actions">
                                                { !request_sent ?
                                                    // <Button color="success"
                                                    //         sx={{borderRadius: 0}}
                                                    //         disabled={is_running}
                                                    //         variant="contained"
                                                    //         onClick={perform_anti_spoofing}
                                                    //         startIcon={<PlayArrowIcon/>}
                                                    // >
                                                    //     Run task
                                                    // </Button>:
                                                    <LoadingButton
                                                        sx={{borderRadius: 0}}
                                                        color="success"
                                                        onClick={perform_anti_spoofing}
                                                        loading={is_running}
                                                        loadingPosition="start"
                                                        startIcon={ <PlayArrowIcon /> }
                                                        variant="contained"
                                                    >
                                                        Run task
                                                    </LoadingButton>:
                                                    <Button color="success"
                                                            sx={{borderRadius: 0}}
                                                        // disabled={is_running}
                                                            variant="contained"
                                                            onClick={re_perform_anti_spoofing}
                                                            startIcon={<ReplayIcon/>}
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

// 515