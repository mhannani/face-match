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
const formdata = require('form-data');

formdata.append("selfie", "real.jpg");

const requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
};

fetch("http://skyanalytics.indatacore.com:4431/check_liveness", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));