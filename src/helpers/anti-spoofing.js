// import * as tf from "@tensorflow/tfjs";
// import * as blazeface from "@tensorflow-models/blazeface";
// import {useSnackbar} from "notistack";
//
// let model, classifier, ctx, videoWidth, videoHeight, video, videoCrop, canvas, label;
// let cmp=0;
// let windows=15;
// let decision=[];
// const { enqueueSnackbar } = useSnackbar();
//
// function ArrayAvg(myArray) {
//     let i = 0, sum = 0, ArrayLen = myArray.length;
//
//     while (i < ArrayLen) {
//         sum = sum + myArray[i++];
//     }
//     return sum / ArrayLen;
// }
//
// //Run camera
// async function setupCamera() {
//     video = document.getElementById('video');
//     video.srcObject = await navigator.mediaDevices.getUserMedia({
//         'audio': false,
//         'video': {
//             facingMode: 'user',
//             width: {exact: 640},
//             height: {ideal: 480},
//             deviceId: {exact: 'b25a6018bdb675995f90e11cd6983f89255cb55e0bcd5c91d1c04a5590f225b2'}
//         },
//     });
//
//     return new Promise((resolve) => {
//         video.onloadedmetadata = () => {
//             resolve(video);
//         };
//     });
// }
//
// //cropped the face detected
// function getImage(video, sizeImg, startImg){
//     const canvasTemp = document.createElement('canvas');
//     canvasTemp.height = sizeImg;
//     canvasTemp.width = sizeImg;
//
//     const ctxTemp = canvasTemp.getContext("2d");
//     ctxTemp.clearRect(0, 0, sizeImg, sizeImg); // clear canvas
//     ctxTemp.drawImage(video, startImg[0], startImg[1], sizeImg, sizeImg, 0, 0, sizeImg, sizeImg);
//     return canvasTemp;
// }
//
//
// export const renderPrediction = async () => {
//     const font = "18px sans-serif";
//     ctx.font = font;
//
//     const returnTensors = false;
//     const flipHorizontal = true;
//     const annotateBoxes = true;
//     const classifySpoof = true;
//
//     const predictions = await model.estimateFaces(
//         video, returnTensors, flipHorizontal, annotateBoxes);
//
//     if (predictions.length===1) {
//         // set_face_as_detected(true)
//         // set_as_spoof(true)
//         cmp++
//         const start = predictions[0].topLeft;
//         const end = predictions[0].bottomRight;
//
//         const bbx_bottom_right_y = predictions[0].bottomRight[1]
//         const bbx_top_left_x = predictions[0].topLeft[0]
//
//         const size = [end[0] - start[0], end[1] - start[1]];
//
//
//         const mid = [(start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5]
//
//         const bbx_w = start[0] - end[0]
//         // create a Square bounding box
//         console.log('a - c: ', start[0] - end[0])
//
//
//         const scale = 1.1
//         const sizeNew = Math.max(size[0], size[1]) * scale
//         const startNew = [mid[0] - (sizeNew * 0.5), mid[1] - (sizeNew * 0.5)]
//
//
//
//         // Perform spoof classification (UNFINISHED!)
//         if (classifySpoof){
//             // Cropping the frame and perform spoof classification
//             videoCrop = getImage(video, sizeNew, startNew);
//
//             // If the past can be done easily int the manner in the best can be done
//             // Predictions
//             const logits = tf.tidy(() => {
//                     const normalizationConstant = 1.0 / 255.0;
//
//                     let tensor = tf.browser.fromPixels(videoCrop, 3)
//                         .resizeBilinear([224, 224], false)
//                         .expandDims(0)
//                         .toFloat()
//                         .mul(normalizationConstant)
//                     // console.log('predict', classifier.predict(tensor))
//                     return classifier.predict(tensor);
//                 }
//             );
//
//
//             const labelPredict = await logits.data();
//
//             if(bbx_w < 180) {
//                 enqueueSnackbar('Setting up environment...', { variant: 'success' })
//             }
//             if(cmp<=windows){
//                 // console.log('labelPrediction: ', labelPredict[0])
//                 decision.push(labelPredict[0]);
//
//                 if(decision.length===windows){
//                     // console.log("15 frame" + labelPredict[0])
//                     ctx.lineWidth = "2";
//                     if(bbx_top_left_x > 360 && bbx_top_left_x < 480 && bbx_bottom_right_y > 280 && bbx_bottom_right_y < 400){
//                         // console.log("bbx_bottom_right_y: ", bbx_bottom_right_y)
//                         // console.log("bbx_top_left_x: ", bbx_top_left_x)
//
//                         if( ArrayAvg(decision) < 0.8 ){
//                             ctx.clearRect(0, 0, canvas.width, canvas.height);
//                             // console.log(ArrayAvg(decision))
//                             label=`Real `+ `(` + ArrayAvg(decision).toFixed(2) + `)`;
//
//                             // Rendering the bounding box
//                             ctx.strokeStyle="green";
//                             ctx.fillStyle = "rgb(10,236,40)";
//                             ctx.strokeRect(startNew[0], startNew[1], sizeNew, sizeNew);
//                             // console.log(startNew[0], startNew[1])
//                             // console.log(label)
//
//                             // Drawing the label
//                             const textWidth = ctx.measureText(label).width;
//                             const textHeight = parseInt(font, 10); // base 10
//                             ctx.fillRect(startNew[0], startNew[1]-textHeight - 5, textWidth + 4, textHeight + 2);
//                             ctx.fillStyle = "#ffffff";
//                             ctx.fillText(label, startNew[0], startNew[1] - 6);
//                             // set_as_spoof(false)
//                             // dispatch(setAsReal())
//                         }
//
//                         else{
//                             ctx.clearRect(0, 0, canvas.width, canvas.height);
//                             label='Spoof ' + `(` + ArrayAvg(decision).toFixed(2) + `)`;
//                             ctx.fillStyle = "rgb(208,25,25)";
//                             // Rendering the bounding box
//                             ctx.strokeStyle="red";
//                             ctx.strokeRect(startNew[0], startNew[1], sizeNew, sizeNew);
//                             // console.log(startNew[0], startNew[1])
//                             //  console.log(label)
//
//                             // Drawing the label
//                             const textWidth = ctx.measureText(label).width;
//                             const textHeight = parseInt(font, 10); // base 10
//                             ctx.fillRect(startNew[0], startNew[1]-textHeight - 5, textWidth + 4, textHeight + 4);
//                             ctx.fillStyle = "#ffffff";
//                             ctx.fillText(label, startNew[0], startNew[1] - 6);
//
//                             // set_as_spoof(true)
//                             // dispatch(setAsSpoof())
//                         }
//                     }
//                     else{
//                         ctx.clearRect(0, 0, canvas.width, canvas.height);
//                     }
//
//
//                     cmp=0;
//                     decision=[];
//                 }
//             }
//         }
//     }
//
//     else{
//         cmp=0;
//         decision=[];
//         const context = canvas.getContext('2d');
//         context.clearRect(0, 0, canvas.width, canvas.height);
//     }
//
//     //like setInterval()
//     requestAnimationFrame(renderPrediction);
//
// };
//
// export const setupPage = async () => {
//
//     await setupCamera();
//     video.play();
//
//     videoWidth = video.videoWidth;
//     videoHeight = video.videoHeight;
//     video.width = videoWidth;
//     video.height = videoHeight;
//
//     // canvas
//     canvas = document.getElementById('output');
//     canvas.width = videoWidth;
//     canvas.height = videoHeight;
//
//     console.log('canvas.width', canvas.width)
//     console.log('canvas.height', canvas.height)
//     console.log('video.width', video.height)
//     console.log('video.height', video.height)
//
//
//     ctx = canvas.getContext('2d');
//
//     //face detection
//     model = await blazeface.load();
//
//     // Load classifier from static storage
//     //classifier = await tf.loadGraphModel('model-graph-f16/anti-spoofing.json');
//     classifier = await tf.loadLayersModel('./rose_model/model.json');
//
//     // classifier.summary();
//     // await renderPrediction();
// };
//
// // useEffect(()=>{
// //     setupPage().then(()=>{
// //         enqueueSnackbar('Performing anti-spoofing task...', { variant: 'success' })
// //     })
// // })
//
// // export const setDimension = async () =>{
// //     let offset_top = document.getElementById('video').offsetTop
// //     let offset_left = document.getElementById('video').offsetLeft
// //     document.getElementsByClassName('overlay-container').style.position = 'absolute'
// //     document.getElementsByClassName('overlay-container').style.top = offset_top
// //     document.getElementsByClassName('overlay-container').style.left = offset_left
// //
// // }
