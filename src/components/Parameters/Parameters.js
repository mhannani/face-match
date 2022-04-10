import {Paper, Slider, styled, Tooltip} from "@mui/material";
import React from "react";
import {setThreshold, setWindows} from "../../store/ParametersSlice";
import {useDispatch, useSelector} from "react-redux";

const CustomSlider = styled(Slider)({
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


export const Parameters = () => {
    const dispatch = useDispatch()

    const handleThresholdChange = async (event) => {
        const { name, value } = event.target;
        dispatch(setThreshold(parseFloat(value)));
    };

    const handleWindowChange =  (event) => {
        const { name, value } = event.target;
        dispatch(setWindows(parseInt(value)));
    };

    // control parameters
    // -----------------
    // The window parameter
    const windows = useSelector((state) => state.parameters.windows)
    // The threshold parameter
    const threshold = useSelector((state) => state.parameters.threshold)

    // App state
    // ----------
    // tracks when application's job is running
    const is_running = useSelector((state) => state.app.is_running)

    return(
        <div className="variables">
            <Tooltip title="Proba > threshold => `spoof`, otherwise `real`" placement="top">
                <Paper key={1} elevation={4} className={'paper'}>
                    <b>Threshold</b>
                    <h4>{threshold}</h4>
                    <CustomSlider
                        valueLabelDisplay="auto"
                        className={'prettoSlider'}
                        aria-label="pretto slider"
                        value={threshold}
                        onChange={handleThresholdChange}
                        min={0.0}
                        max={1.0}
                        step={0.01}
                        disabled={is_running}
                    />
                </Paper>
            </Tooltip>

            <Tooltip title="Number of frames to take in order to make decision" placement="top" >
                <Paper key={2} elevation={4} className={'paper'}>
                    <b>Windows</b>
                    <h4>{windows}</h4>
                    <CustomSlider
                        valueLabelDisplay="auto"
                        className={'prettoSlider'}
                        aria-label="pretto slider"
                        value={windows}
                        onChange={handleWindowChange}
                        min={1}
                        max={50}
                        disabled={is_running}
                    />
                </Paper>
            </Tooltip>
        </div>
    )
}