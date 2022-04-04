import { createSlice } from '@reduxjs/toolkit'

const screenshotsState = {
    selfie_uri: null,
}

export const ScreenshotsSlice = createSlice({
    name: 'screenshots',
    initialState: screenshotsState,
    reducers: {
        setSelfie: ( state, action) => {
            return{
                ...state,
                selfie_uri: action.payload
            }
        },
    }
})

// Action creators are generated for each case reducer function
export const { setSelfie } = ScreenshotsSlice.actions

export default ScreenshotsSlice.reducer