import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { ExitResponse, ExitResponseState } from "../types";
import {
  submitExitResponseApi,
  fetchEmployeeExitResponseApi,
  fetchAllExitResponsesApi,
} from "../api/exitResponseApi";

const initialState: ExitResponseState = {
  exitResponses: [],
  activeResponse: null,
  isLoading: false,
  error: null,
};

// Asynchronous Thunks
export const submitExitResponse = createAsyncThunk(
  "exitResponse/submit",
  async (
    responseData: {
      resignationId: string;
      whyLeaving: string;
      whatLiked: string;
      whatDisliked: string;
      recommendCompany: "yes" | "no" | "maybe";
      suggestions: string;
      overallRating: number;
      additionalFeedback?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await submitExitResponseApi(responseData);
      return data.exitResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to submit exit interview"
      );
    }
  }
);

export const fetchEmployeeExitResponse = createAsyncThunk(
  "exitResponse/fetchEmployee",
  async (resignationId: string, { rejectWithValue }) => {
    try {
      const data = await fetchEmployeeExitResponseApi(resignationId);
      return data.exitResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch exit interview"
      );
    }
  }
);

export const fetchAllExitResponses = createAsyncThunk(
  "exitResponse/fetchAll",
  async (
    params: {
      search?: string;
      rating?: number;
      recommend?: string;
      page?: number;
      limit?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const data = await fetchAllExitResponsesApi(params);
      return data; // Expecting { exitResponses: ExitResponse[], totalPages: number, currentPage: number }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch all exit interview responses"
      );
    }
  }
);

const exitResponseSlice = createSlice({
  name: "exitResponse",
  initialState,
  reducers: {
    clearExitResponseError: (state) => {
      state.error = null;
    },
    resetExitResponseState: (state) => {
      state.exitResponses = [];
      state.activeResponse = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Exit Response
      .addCase(submitExitResponse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitExitResponse.fulfilled, (state, action: PayloadAction<ExitResponse>) => {
        state.isLoading = false;
        state.activeResponse = action.payload;
        state.exitResponses = state.exitResponses.map((res) =>
          res.id === action.payload.id ? action.payload : res
        );
      })
      .addCase(submitExitResponse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Employee Exit Response
      .addCase(fetchEmployeeExitResponse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeExitResponse.fulfilled, (state, action: PayloadAction<ExitResponse>) => {
        state.isLoading = false;
        state.activeResponse = action.payload;
      })
      .addCase(fetchEmployeeExitResponse.rejected, (state, action) => {
        state.isLoading = false;
        // Not finding an exit response is a normal flow if they haven't submitted yet
        state.activeResponse = null;
      })
      // Fetch All Exit Responses (HR)
      .addCase(fetchAllExitResponses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllExitResponses.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.exitResponses = action.payload.exitResponses || action.payload;
      })
      .addCase(fetchAllExitResponses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearExitResponseError, resetExitResponseState } = exitResponseSlice.actions;
export default exitResponseSlice.reducer;
