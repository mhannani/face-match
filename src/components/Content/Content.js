import React, {useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import Switch from 'react-switch';
import Camera from '../Camera/Camera';
// import { createFaLibrary } from './helpers/icons';
import {loadModels} from "../../helpers/faceApi";
import {useSnackbar} from "notistack";


const Content = ()=>{
    const { enqueueSnackbar } = useSnackbar();
    const [mode, setMode] = useState(false); //true = photo mode; false = video mode

    loadModels().then(()=>{
        enqueueSnackbar('🎈🎈 ML models loaded successfully🎈🎈 !', { variant: 'success' })
    });

    return(
        <div className="App">
            <header>
                <div className="App__header">
                    <div className="App__switcher">
                        <h2>Face detection</h2>
                    </div>
                </div>
            </header>
            <Camera photoMode={mode} />
        </div>
    )
}

export default Content