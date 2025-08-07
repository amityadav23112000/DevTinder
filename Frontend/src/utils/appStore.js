import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; // Adjust the import path as necessary
import feedReducer from "./feedSlice"; // Adjust the import path as necessary

const appStore = configureStore({
    // Define the initial state of your store



    reducer: {
        // Add your reducers here
        user: userReducer, // This will handle user-related state
        feed : feedReducer, // This will handle feed-related state
    },
});


export default appStore;