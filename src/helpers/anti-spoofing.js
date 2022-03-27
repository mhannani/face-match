import React from "react";

export const svgIcon = () => (
    <svg
        width="100%"
        height="100%"
        className="ellipse"
        viewBox="0 0 260 200"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        xmlnsXlink="http://www.w3.org/1999/xlink">
        <defs>
            <mask id="overlay-mask" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="#fff" className={'rect'}/>
                <ellipse id="ellipse-mask" cx="50%" cy="50%" rx="50" ry="70" />
            </mask>
        </defs>

        <rect x="0" y="0" width="100%" height="100%" mask="url(#overlay-mask)" fillOpacity="0.5"/>
    </svg>
);


export function ArrayAvg(myArray) {
    let i = 0, sum = 0, ArrayLen = myArray.length;

    while (i < ArrayLen) {
        sum = sum + myArray[i++];
    }
    return sum / ArrayLen;
}
