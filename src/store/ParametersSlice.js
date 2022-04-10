import { createSlice } from '@reduxjs/toolkit'

const parametersState = {
    windows: 5,
    threshold: 0.0
}

export const ParametersSlice = createSlice({
    name: 'parameters',
    initialState: parametersState,
    reducers: {
        setWindows: ( state, action) => {
            return{
                ...state,
                windows: action.payload
            }
        },

        setThreshold: ( state, action) => {
            return{
                ...state,
                threshold: action.payload
            }
        }
    }
})

// Action creators are generated for each case reducer function
export const { setWindows, setThreshold } = ParametersSlice.actions

export default ParametersSlice.reducer