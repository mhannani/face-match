import { createSlice } from '@reduxjs/toolkit'

const faceInitialState = {
    face_detected: false,
    do_liveness: false
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
        reset: (state, action) => {
            return faceInitialState
        }
    },
})

// Action creators are generated for each case reducer function
export const { setFaceAsDetected, canCheckLiveness, reset } = FaceSlice.actions

export default FaceSlice.reducer