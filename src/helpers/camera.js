export async function setupCamera() {
    let video = document.getElementById('video');
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