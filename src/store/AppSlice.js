import { createSlice } from '@reduxjs/toolkit'

const appState = {
    is_running: false,
    is_loading: false,
    start_liveness: false,
    message: null
}

export const AppSlice = createSlice({
    name: 'app',
    initialState: appState,
    reducers: {
        setIsRunning: ( state, action) => {
            return{
                ...state,
                is_running: action.payload
            }
        },

        setIsLoading: ( state, action) => {
            return{
                ...state,
                is_loading: action.payload
            }
        },
        setMessage: ( state, action) => {
            return{
                ...state,
                message: action.payload
            }
        },
        setStartLiveness: ( state, action) => {
            return{
                ...state,
                start_liveness: action.payload
            }
        }
    }
})

// Action creators are generated for each case reducer function
export const { setIsRunning, setIsLoading, setMessage, setStartLiveness } = AppSlice.actions

export default AppSlice.reducer