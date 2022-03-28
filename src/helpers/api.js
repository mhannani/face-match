// const axios = require('axios')
//
// const send_request = (image) =>{
//
//     // Sending request
//     axios.post('http://skyanalytics.indatacore.com:4431/check_liveness').then((response) =>{
//         console.log(response)
//     }).catch(error => {
//         console.error('There was an error!', error);
//     });
// }
//
// send_request()
// const formdata = require('form-data');
//
// formdata.append("selfie", "real.jpg");
//
// const requestOptions = {
//     method: 'POST',
//     body: formdata,
//     redirect: 'follow'
// };
//
// fetch("http://skyanalytics.indatacore.com:4431/check_liveness", requestOptions)
//     .then(response => response.text())
//     .then(result => console.log(result))
//     .catch(error => console.log('error', error));
//
//
// function _base64ToArrayBuffer(base64) {
//     var binary_string =  window.atob(base64);
//     var len = binary_string.length;
//     var bytes = new Uint8Array( len );
//     for (var i = 0; i < len; i++)        {
//         bytes[i] = binary_string.charCodeAt(i);
//     }
//     return bytes.buffer;
// }
//
// function _base64ToArrayBuffer(base64) {
//     var binary_string =  window.atob(base64);
//     var len = binary_string.length;
//     var bytes = new Uint8Array( len );
//     for (var i = 0; i < len; i++)        {
//         bytes[i] = binary_string.charCodeAt(i);
//     }
//     return bytes.buffer;
// }
// _____
// compressed_image = compressed_image.replace('data:image/jpeg;base64,', '');
// var binary_data=_base64ToArrayBuffer(compressed_image)
// var myImage= new File([binary_data], "byts_document.jpg",{type:"application/octet-stream"})
// ________
// var form_data = new FormData();
// form_data.append("document",myImage);
// form_data.append('institution_id',institution_id);
// form_data.append('application_id',application_id);
// form_data.append('channel_id',channel_id);
// form_data.append('service_id',service_id);
// form_data.append('sub_service_id',sub_service_id);
// form_data.append('token',token);
// form_data.append("request_data",'{"doc_type":"'+doc_type+'"}');
// $.ajax({
//     url : "http://"+serverIP+":7001/extract_info_from_document",
//     type :
//


function _base64ToArrayBuffer(base64) {
    let binary_string =  window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array( len );
    for (let i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export const make_requests = (canvas) => {

    // Get the content of the current canvas as an image
    // that you can use as a source for another canvas or an HTML element.
    const canvas_content = canvas.toDataURL('png')
    const cleaned_canvas_content = canvas_content.replace('data:image/png;base64,', '');
    const binary_data = _base64ToArrayBuffer(cleaned_canvas_content)

    let img = new File([binary_data], "byts_document.jpg",{type:"application/octet-stream"})
    let form_data = new FormData();
    form_data.append("selfie", img);

    return  {
        method: 'POST',
        body: form_data,
        redirect: 'follow'
    };

}
