import { createSlice } from '@reduxjs/toolkit'

const faceMatchState = {
    face_match_request_sent: false,
    face_match_api_response: null,
    face_match_api_error: null,
    similarity: null,
    sky_face_match_decision_label: null
}

export const ApiSlice = createSlice({
    name: 'face_match_api',
    initialState: faceMatchState,
    reducers: {
        setFaceMatchRequestSent: ( state, action) => {
            return{
                ...state,
                face_match_request_sent: action.payload
            }
        },

        setFaceMatchApiResponse: ( state, action) => {
            return{
                ...state,
                face_match_api_response: action.payload
            }
        },
        setFaceMatchApiError: ( state, action) => {
            return{
                ...state,
                face_match_api_error: action.payload
            }
        },
        setSimilarity: ( state, action) => {
            return{
                ...state,
                similarity: action.payload
            }
        },
        setSkyFaceMatchDecisionLabel: ( state, action) => {
            return{
                ...state,
                sky_face_match_decision_label: action.payload
            }
        }
    }
})

// Action creators are generated for each case reducer function
export const { setFaceMatchRequestSent, setFaceMatchApiResponse,
    setFaceMatchApiError, setSimilarity, setSkyFaceMatchDecisionLabel} = ApiSlice.actions

export default ApiSlice.reducer