import { createSlice } from '@reduxjs/toolkit'

const UploadState = {
    is_uploaded: false,
    last_modified: null
}

export const AppSlice = createSlice({
    name: 'upload',
    initialState: UploadState,
    reducers: {
        setIsUploaded: ( state, action) => {
            return{
                ...state,
                is_running: action.payload
            }
        },
    }
})

// Action creators are generated for each case reducer function
export const { setIsUploaded } = AppSlice.actions

export default AppSlice.reducer
