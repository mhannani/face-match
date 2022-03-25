// let model, classifier, ctx, videoWidth, videoHeight, video, videoCrop, canvas;
// cmp=0;
// windows=15;//number of frames
// decision=[];//contains the precision of each  frame
//
// function ArrayAvg(myArray) {
//     var i = 0, summ = 0, ArrayLen = myArray.length;
//     while (i < ArrayLen) {
//         summ = summ + myArray[i++];
//     }
//     return summ / ArrayLen;
// }
//
//
// //run camera
// async function setupCamera() {
//     video = document.getElementById('video');
//
//     const stream = await navigator.mediaDevices.getUserMedia({
//         'audio': false,
//         'video': { facingMode: 'user' },
//     });
//     video.srcObject = stream;
//
//     return new Promise((resolve) => {
//         video.onloadedmetadata = () => {
//             resolve(video);
//         };
//     });
// }
//
//
// //cropped the  face detected
// function getImage(video, sizeImg, startImg) {
//     const canvasTemp = document.createElement('canvas');
//     canvasTemp.height = sizeImg;
//     canvasTemp.width = sizeImg;
//
//     const ctxTemp = canvasTemp.getContext("2d");
//     ctxTemp.clearRect(0, 0, sizeImg, sizeImg); // clear canvas
//
//     ctxTemp.drawImage(video, startImg[0], startImg[1], sizeImg, sizeImg, 0, 0, sizeImg, sizeImg);
//
//     return canvasTemp;
// }
//
//
//
// const renderPrediction = async () => {
//
//     const font = "24px sans-serif";
//     ctx.font = font;
//
//     const returnTensors = false;
//     const flipHorizontal = true;
//     const annotateBoxes = true;
//     const classifySpoof = true;
//     const predictions = await model.estimateFaces(
//         video, returnTensors, flipHorizontal, annotateBoxes);
//     console.log(predictions)
//
//
//     if (predictions.length==1) {//this condition to ensure that there is only one face
//         cmp++
//
//         const start = predictions[0].topLeft;
//         const end = predictions[0].bottomRight;
//         const size = [end[0] - start[0], end[1] - start[1]];
//         const mid = [(start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5]
//
//         // create a Square bounding box
//         const scale = 1.1
//         const sizeNew = Math.max(size[0], size[1]) * scale
//         const startNew = [mid[0] - (sizeNew * 0.5), mid[1] - (sizeNew * 0.5)]
//
//
//
//         // Perform spoof classification (UNFINISHED!)
//         if (classifySpoof) {
//             // Cropping the frame and perform spoof classification
//             videoCrop = getImage(video, sizeNew, startNew);
//
//             ////predection
//             const logits = tf.tidy(() => {
//                 const normalizationConstant = 1.0 / 255.0;
//
//                 let tensor = tf.browser.fromPixels(videoCrop, 3)
//                     .resizeBilinear([224, 224], false)
//                     .expandDims(0)
//                     .toFloat()
//                     .mul(normalizationConstant)
//                 return classifier.predict(tensor);
//             });
//
//             const labelPredict = await logits.data();
//             console.log(labelPredict[0])
//
//
//             if(cmp<=windows){
//                 decision.push(labelPredict[0]);
//
//
//                 if(decision.length==windows){
//                     console.log("15 frame"+labelPredict[0])
//
//                     if(ArrayAvg(decision)<0.8){
//                         ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//                         label='Real';
//                         // Rendering the bounding box
//                         ctx.strokeStyle="white";
//                         ctx.lineWidth = "4";
//                         ctx.strokeRect(startNew[0], startNew[1], sizeNew, sizeNew);
//                         // console.log(label)
//
//                         // Drawing the label
//                         const textWidth = ctx.measureText(label).width;
//                         const textHeight = parseInt(font, 10); // base 10
//                         ctx.fillRect(startNew[0], startNew[1]-textHeight, textWidth + 4, textHeight + 4);
//                         ctx.fillText(label, startNew[0], startNew[1]);
//
//                     }
//
//
//                     else{
//                         ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//                         label='spoof';
//                         // Rendering the bounding box
//                         ctx.strokeStyle="red";
//                         ctx.lineWidth = "4";
//                         ctx.strokeRect(startNew[0], startNew[1], sizeNew, sizeNew);
//                         //  console.log(label)
//
//
//                         // Drawing the label
//                         const textWidth = ctx.measureText(label).width;
//                         const textHeight = parseInt(font, 10); // base 10
//                         ctx.fillRect(startNew[0], startNew[1]-textHeight, textWidth + 4, textHeight + 4);
//                         ctx.fillText(label, startNew[0], startNew[1]);
//                     }
//                     cmp=0;
//                     decision=[];
//                 }
//             }
//
//         }
//
//     }
//
//     else{
//         cmp=0;
//         decision=[];
//         const context = canvas.getContext('2d');
//         context.clearRect(0, 0, canvas.width, canvas.height);
//
//     }
//
// //like setInterval()
//     requestAnimationFrame(renderPrediction);
// };
//
//
//
// const setupPage = async () => {
//     await setupCamera();
//     video.play();
//
//     videoWidth = video.videoWidth;
//     videoHeight = video.videoHeight;
//     video.width = videoWidth;
//     video.height = videoHeight;
//
// // canavs
//     canvas = document.getElementById('output');
//     canvas.width = videoWidth;
//     canvas.height = videoHeight;
//     ctx = canvas.getContext('2d');
//     ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
//
// //face detection
//     model = await blazeface.load();
//
//     // Load classifier from static storage
//     //classifier = await tf.loadGraphModel('model-graph-f16/anti-spoofing.json');
//     classifier = await tf.loadLayersModel('rose_model/model.json');
//
//     // classifier.summary();
//     renderPrediction();
// };
//
// setupPage();