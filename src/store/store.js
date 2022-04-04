import { configureStore } from '@reduxjs/toolkit'
import ParametersReducer from "./ParametersSlice";
import AppReducer from "./AppSlice"
import ScreenshotsReducer from "./screenshotsSlice"
import ApiReducer from "./apiSlice"
import ConfettiReducer from "./confettiSlice"

const store = configureStore({
    reducer: {
        parameters: ParametersReducer,
        app: AppReducer,
        screenshots: ScreenshotsReducer,
        api: ApiReducer,
        confetti: ConfettiReducer
    },
})

export default store