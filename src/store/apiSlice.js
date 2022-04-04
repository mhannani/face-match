import { createSlice } from '@reduxjs/toolkit'

const apiState = {
    request_sent: false,
    api_response: null,
    api_error: null
}

export const ApiSlice = createSlice({
    name: 'api',
    initialState: apiState,
    reducers: {
        setRequestSent: ( state, action) => {
            return{
                ...state,
                request_sent: action.payload
            }
        },

        setApiResponse: ( state, action) => {
            return{
                ...state,
                api_response: action.payload
            }
        },
        setApiError: ( state, action) => {
            return{
                ...state,
                api_error: action.payload
            }
        }
    }
})

// Action creators are generated for each case reducer function
export const { setRequestSent, setApiResponse, setApiError} = ApiSlice.actions

export default ApiSlice.reducer