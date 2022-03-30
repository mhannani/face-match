import React from 'react'
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import "./confetti.css"


export default ({is_run}) => {
    const { width, height } = useWindowSize()
    console.log('is_run: ', is_run)
    return (
        <Confetti
            width={width}
            height={height}
            run={is_run}
            numberOfPieces={300}
            // tweenFunction={10}
            gravity={0.2}
        />
    )
}
