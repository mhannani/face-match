import { configureStore } from '@reduxjs/toolkit'
import FaceReducer from './faceSlice'
import ParametersReducer from "./ParametersSlice";
import AppReducer from "./AppSlice"


const store = configureStore({
    reducer: {
        face: FaceReducer,
        parameters: ParametersReducer,
        app: AppReducer
    },
})

export default store