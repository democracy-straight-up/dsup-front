import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import billReducer from "./billSlice";

export const store = configureStore({
  reducer: {
    AuthUser: userReducer,
    bills: billReducer,
  },
});
