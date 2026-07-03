import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import authReducer from "./authSlice";
import resignationReducer from "./resignationSlice";
import exitResponseReducer from "./exitResponseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resignation: resignationReducer,
    exitResponse: exitResponseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Turn off serializable checks for simple Date/Attachment handling
    }),
});

// TypeScript type exports for safety
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Type-safe custom hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
