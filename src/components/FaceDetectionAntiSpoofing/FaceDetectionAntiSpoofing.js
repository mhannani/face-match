import React, {useEffect, useRef, useState} from 'react'
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import './face_detection_anti_spoofing.css'
import avatar from '../../assets/avatar.png'
import {ArrayAvg, svgIcon} from "../../helpers/anti-spoofing";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import {make_requests} from "../../helpers/api";
import Confetti from '../Confetti/Confetti'
import SyncLoader from "react-spinners/SyncLoader";

// import Webcam from "react-webcam";
// import classnames from "classnames";
// import {setAsReal, setAsSpoof, reset} from "../../store/faceSlice";
// import {renderPrediction, setDimension, setupPage} from '../../helpers/anti-spoofing'
// import {useDispatch, useSelector} from "react-redux";
import {
    // Alert,
    // AlertTitle,
    Button,
    CircularProgress,
    Fade,
    Paper,
    Slider,
    styled,
    Tooltip
} from "@mui/material";
import {useSnackbar} from "notistack";
// import Spinner from "../Spinner/Spinner";

// import {round} from "@tensorflow/tfjs";

const PrettoSlider = styled(Slider)({
    color: '#52af77',
    height: 8,
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
    },
    '& .MuiSlider-valueLabel': {
        lineHeight: 1.2,
        fontSize: 12,
        background: 'unset',
        padding: 0,
        width: 32,
        height: 32,
        borderRadius: '50% 50% 50% 0',
        backgroundColor: '#52af77',
        transformOrigin: 'bottom left',
        transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
        '&:before': { display: 'none' },
        '&.MuiSlider-valueLabelOpen': {
            transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
        },
        '& > *': {
            transform: 'rotate(45deg)',
        },
    },
});




let model, classifier, ctx, videoWidth, videoHeight, video, videoCrop, canvas, label;
let cmp=0;
// let windows=15;
let decision=[];
let oldfaceDet=1;

let ellipsewarningCounter=0;
let headSizeewarningCounter=0;

const FaceDetectionAntiSpoofing = () => {

    const [windows, setWindows] = useState(15);
    const [is_running, set_is_running] = useState(false)
    const [is_ready_to_spoofing_task, set_is_ready_to_spoofing_task] = useState(false)

    const [selfie_1, set_selfie_1] = useState(null)
    const [selfie_2, set_selfie_2] = useState(null)

    const [selfie_1_taken, set_selfie_1_as_taken] = useState(false)
    const [selfie_2_taken, set_selfie_2_as_taken] = useState(false)

    const [request_sent, set_request_as_sent] = useState(false)

    const [api_response, set_api_response] = useState(null)

    const [is_real, set_is_real] = useState(null)

    const [app_loading, set_app_as_loading] = useState(false)
    const [conf_is_running, set_conf_as_running] = useState(false)

    const [api_error, set_api_error] = useState(null)
    const [thresholdValue, setThresholdValue] = useState(0.8)
    const { enqueueSnackbar } = useSnackbar();

    // const dispatch = useDispatch()



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
        canvasTemp.height = sizeImg[1];
        canvasTemp.width = sizeImg[0];

        const ctxTemp = canvasTemp.getContext("2d");
        //ctxTemp.clearRect(0, 0, sizeImg[0], sizeImg[1]); // clear canvas
        ctxTemp.drawImage(video, startImg[0], startImg[1], sizeImg[0], sizeImg[1], 0, 0, sizeImg[0], sizeImg[1]);

        // output.appendChild(canvasTemp)
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
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        const font = "18px sans-serif";
        ctx.font = font;
        let myframe=getFrame(video);
        //await capture(myframe,  1)
        // console.log('windows, thresholdValue: ', windows, thresholdValue)
        const returnTensors = false;
        const flipHorizontal = false;
        const annotateBoxes = true;
        const classifySpoof = true;

        const predictions = await model.estimateFaces(
            myframe, returnTensors, flipHorizontal, annotateBoxes);


        if (predictions.length===1) {

            const start = predictions[0].topLeft;
            const end = predictions[0].bottomRight;

            const bbx_bottom_right_y = predictions[0].bottomRight[1]
            const bbx_top_left_x = predictions[0].topLeft[0]

            const size = [end[0] - start[0], end[1] - start[1]];
            // decision = []

            //const mid = [(start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5]

            const bbx_w = end[0] - start[0]
            // create a Square bounding box


            //const scale = 1.1
            //const sizeNew = Math.max(size[0], size[1]) * scale
            //const startNew = [mid[0] - (sizeNew * 0.5), mid[1] - (sizeNew * 0.5)]
            // console.log('threshold 2: ', thresholdValue)

            if (bbx_top_left_x > 130 && bbx_top_left_x < 470 && bbx_bottom_right_y > 100 && bbx_bottom_right_y < 420) {
                ellipsewarningCounter=0;
                if (bbx_w > 150) {
                    headSizeewarningCounter=0;
                    cmp++
                    if (classifySpoof) {
                        videoCrop = getImage(myframe, size, start);

                        // check antispoofing
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
                        decision.push(labelPredict[0]);

                        if (decision.length === windows) {
                            const meanProb = ArrayAvg(decision);
                            if (meanProb < thresholdValue) { // real
                                set_selfie_1_as_taken(true)
                                if (oldfaceDet > labelPredict[0]) {
                                    oldfaceDet = labelPredict[0];
                                    await capture(myframe, 1)
                                }
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
                                const requestOptions = make_requests(myframe)
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
                                        set_is_running(false);


                                    })

                                    .catch(error => console.log('error', error));
                                set_request_as_sent(true)
                                capture = () => {}

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


        // const imgSrc = context.toDataURL('png')
        // console.log(imgSrc)

        // Load classifier from static storage
        classifier = await tf.loadLayersModel('./rose_model/model.json');

        // classifier.summary();
        // await renderPrediction();
    };

    useEffect(  () => {
        set_conf_as_running(false)
        set_app_as_loading(true)

        setTimeout(()=>{
            set_app_as_loading(false)
        }, 3000)

        // setupPage().then(() => {
        //     enqueueSnackbar('Setting up environment...', { variant: 'success' })
        //     set_is_ready_to_spoofing_task(true)
        // })
    },[])

    const delay = ms => new Promise(res => setTimeout(res, ms));

    let capture = async (canvas_img, selfie_id) => {
        let img_source = canvas_img.toDataURL();
        // console.log('selfie_1_as_taoken ---- capture func: ', selfie_1_taken)
        // console.log('selfie_2_as_taoken ---- capture func: ', selfie_2_taken)

        if(selfie_id === 1){
            set_selfie_1(img_source)
            set_selfie_1_as_taken(true)
        }

        await delay(500);

        if(selfie_id === 2){
            set_selfie_2(img_source)
            set_selfie_2_as_taken(true)
        }

    };


    const handleThresholdChange = async (event) => {
        const { name, value } = event.target;

        setThresholdValue(parseFloat(value));
        // setupCamera()
        // setupPage()
        // event.persist()
    };

    const handleWindowChange = async (event) => {
        const { name, value } = event.target;

        setWindows(parseInt(value));
        // setupCamera()
        // setupPage()
        // event.persist()
    };

    const perform_anti_spoofing = async (event) => {
        cmp = 0
        set_api_response(null)
        event.preventDefault();
        // console.log("event: ", thresholdValue, window)
        // console.log('perform')
        set_is_running(true)
        setupPage().then( async() => {

            enqueueSnackbar('Performing Anti-spoofing task...', { variant: 'info' })
            await renderPrediction();
        })

    }

    const refreshPage = () => {
        window.location.reload();
    }

    return(
        <>
            {
                app_loading ?
                <div className={'app_loader'}>
                    <SyncLoader size={20} />
                    <h3>Getting environment ready...</h3>
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
                                    <div className={'row_avatar'}>
                                        <div className={'column_avatar'}>
                                            <img className={'frame_1'} src={selfie_1 ? selfie_1 : avatar} alt={'avatar'}/>
                                            <h6>SELFIE</h6>
                                        </div>
                                    </div>
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

                                    <div className="variables">
                                        <Tooltip title="Proba > threshold => `spoof`, otherwise `real`" placement="top">
                                            <Paper key={1} elevation={4} className={'paper'}>
                                                <b>Threshold</b>
                                                <h4>{thresholdValue}</h4>
                                                <PrettoSlider
                                                    valueLabelDisplay="auto"
                                                    className={'prettoSlider'}
                                                    aria-label="pretto slider"
                                                    defaultValue={thresholdValue}
                                                    onChange={handleThresholdChange}
                                                    min={0.1}
                                                    max={1.0}
                                                    step={0.1}
                                                    disabled={is_running}
                                                />
                                            </Paper>
                                        </Tooltip>

                                        <Tooltip title="Number of frames to take in order to make decision" placement="top" >
                                            <Paper key={2} elevation={4} className={'paper'}>
                                                <b>Windows</b>
                                                <h4>{windows}</h4>
                                                <PrettoSlider
                                                    valueLabelDisplay="auto"
                                                    className={'prettoSlider'}
                                                    aria-label="pretto slider"
                                                    defaultValue={windows}
                                                    onChange={handleWindowChange}
                                                    min={1}
                                                    max={30}
                                                    disabled={is_running}
                                                />
                                            </Paper>
                                        </Tooltip>



                                    </div>


                                    <div className="row actions">
                                        <Button color="success"
                                                sx={ { borderRadius: 0 }}
                                                disabled={is_running}
                                                variant="contained"
                                                onClick={perform_anti_spoofing}
                                                startIcon={<PlayArrowIcon />}
                                        >
                                            Run task
                                        </Button>

                                        {/*<Button variant="contained" color="info"*/}
                                        {/*        sx={ { borderRadius: 0 }}*/}
                                        {/*        onClick={capture}*/}
                                        {/*        disabled={is_running}*/}
                                        {/*>*/}
                                        {/*    Take screenshots*/}

                                        {/*</Button>*/}

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
        </>



    )
}

export default FaceDetectionAntiSpoofing
