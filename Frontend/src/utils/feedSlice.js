import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
    name: "feed",
    initialState: null,
    reducers: {
        addFeed: (state, action) => {
            return action.payload;
        },
        removeUserFromFeed: (state, action) => {
            const newFeed = state.filter(user => user._id !== action.payload);
            return newFeed;
        },
    
    }
});
export const { addFeed, removeUserFromFeed } = feedSlice.actions;
export default feedSlice.reducer;
// This code defines a Redux slice for managing feed-related state in a React application.