import { createSlice } from '@reduxjs/toolkit'

const faceInitialState = {
    face_detected: false,
    do_liveness: false,
    screenshot_path: null,
    is_spoof: null
}

export const FaceSlice = createSlice({
    name: 'face',
    initialState: faceInitialState,
    reducers: {
        setFaceAsDetected: (state) => {
            return {
                ...state,
                face_detected: true,
            }
        },

        canCheckLiveness: (state) => {
            return {
                ...state,
                do_liveness: true,
            }
        },

        setScreenShotsPath: (state,action) => {
            // console.log(state)
            // console.log('action: ', action.payload.screenshot_path)
            return{
                ...state,
                screenshot_path: action.payload
            }
        },

        setAsSpoof: (state) => {
            return {
                ...state,
                is_spoof: true,
            }
        },
        setAsReal: (state) => {
            return {
                ...state,
                is_spoof: false,
            }
        },

        reset: (state, action) => {
            return faceInitialState
        }
    },
})

// Action creators are generated for each case reducer function
export const { setFaceAsDetected, canCheckLiveness, setScreenShotsPath, setAsReal, setAsSpoof, reset } = FaceSlice.actions

export default FaceSlice.reducer