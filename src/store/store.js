import { configureStore } from '@reduxjs/toolkit'
import ParametersReducer from "./ParametersSlice";
import AppReducer from "./AppSlice"
import ScreenshotsReducer from "./screenshotsSlice"
import ApiReducer from "./apiSlice"
import ConfettiReducer from "./confettiSlice"
import UploadReducer from "./uploadSlice";
import FaceMatchApi from "./faceMatchSlice";

const store = configureStore({
    reducer: {
        parameters: ParametersReducer,
        app: AppReducer,
        screenshots: ScreenshotsReducer,
        api: ApiReducer,
        face_match_api: FaceMatchApi,
        confetti: ConfettiReducer,
        upload: UploadReducer
    },
})

export default store