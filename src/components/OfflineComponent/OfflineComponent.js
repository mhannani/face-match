import WifiOffIcon from "@mui/icons-material/WifiOff";
import {Offline} from "react-detect-offline";
import React, {useEffect} from "react";
import './Offline_component.css'

export const OfflineComponent = ()=>{
    return(
        <Offline>
            <div className={'no-internet'}>
                <WifiOffIcon color="error" fontSize={'large'}/>
                <h5>Oops ! You are offline now ! Please check your internet connection </h5>
            </div>
        </Offline>
    )
}