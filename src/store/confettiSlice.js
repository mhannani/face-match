import { createSlice } from '@reduxjs/toolkit'

const confettiState = {
    show_confetti: false,
}

export const ConfettiSlice = createSlice({
    name: 'confetti',
    initialState: confettiState,
    reducers: {
        setShowConfetti: ( state, action) => {
            return{
                ...state,
                show_confetti: action.payload
            }
        },
    }
})

// Action creators are generated for each case reducer function
export const { setShowConfetti } = ConfettiSlice.actions

export default ConfettiSlice.reducer