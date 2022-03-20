import { configureStore } from '@reduxjs/toolkit'
import FaceReducer from './faceSlice'

const store = configureStore({
    reducer: {
        face: FaceReducer,
    },
})

export default store