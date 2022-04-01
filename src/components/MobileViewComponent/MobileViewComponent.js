import MobileOffIcon from "@mui/icons-material/MobileOff";
import {MobileView} from "react-device-detect";
import React from "react";

export const MobileViewComponent = ()=>{
    return(
        <MobileView>
            <div className={'on_mobile'}>
                <MobileOffIcon fontSize={'large'}/>
                <h5>At the moment, this application is available only on desktop screens... Please bring up your laptop :).</h5>
            </div>
        </MobileView>
    )
}