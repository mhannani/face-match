import { createSlice } from '@reduxjs/toolkit'

const UploadState = {
    is_loading: true,
    is_uploaded: false,
    uploaded_file: null,
    filename: null,
    guid: null
}

export const AppSlice = createSlice({
    name: 'upload',
    initialState: UploadState,
    reducers: {
        setIsLoading: ( state, action) => {
            return{
                ...state,
                is_loading: action.payload
            }
        },
        setIsUploaded: ( state, action) => {
            return{
                ...state,
                is_uploaded: action.payload
            }
        },
        setUploadedFile: ( state, action) => {
            return{
                ...state,
                uploaded_file: action.payload
            }
        },
        setGuid: ( state, action) => {
            return{
                ...state,
                guid: action.payload
            }
        },
        setFilename: ( state, action) => {
            return{
                ...state,
                filename: action.payload
            }
        },
    }
})

// Action creators are generated for each case reducer function
export const { setIsUploaded, setUploadedFile, setGuid, setFilename, setIsLoading } = AppSlice.actions

export default AppSlice.reducer