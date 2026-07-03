import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Resignation, ResignationState } from "../types";
import {
  submitResignationApi,
  fetchEmployeeResignationsApi,
  fetchAllResignationsApi,
  concludeResignationApi,
} from "../api/resignationApi";

const initialState: ResignationState = {
  resignations: [],
  activeResignation: null,
  isLoading: false,
  error: null,
};

// Asynchronous Thunks
export const submitResignation = createAsyncThunk(
  "resignation/submit",
  async (
    resignationData: {
      reason: string;
      detailedDescription: string;
      lastWorkingDate: string; // YYYY-MM-DD
      managerName: string;
      comments?: string;
      noticePeriod: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await submitResignationApi(resignationData);
      return data.resignation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to submit resignation"
      );
    }
  }
);

export const fetchEmployeeResignations = createAsyncThunk(
  "resignation/fetchEmployee",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchEmployeeResignationsApi();
      return data.resignations || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch resignations"
      );
    }
  }
);

export const fetchAllResignations = createAsyncThunk(
  "resignation/fetchAll",
  async (
    params: {
      search?: string;
      status?: string;
      sort?: string;
      page?: number;
      limit?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const data = await fetchAllResignationsApi(params);
      return data; // Expecting { resignations: Resignation[], totalPages: number, currentPage: number }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch all resignations"
      );
    }
  }
);

export const concludeResignation = createAsyncThunk(
  "resignation/conclude",
  async (
    data: {
      resignationId: string;
      action: "approve" | "reject";
      remarks?: string;
      finalLastWorkingDate?: string; // YYYY-MM-DD
    },
    { rejectWithValue }
  ) => {
    try {
      const responseData = await concludeResignationApi(data);
      return responseData.resignation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to conclude resignation"
      );
    }
  }
);

const resignationSlice = createSlice({
  name: "resignation",
  initialState,
  reducers: {
    clearResignationError: (state) => {
      state.error = null;
    },
    resetResignationState: (state) => {
      state.resignations = [];
      state.activeResignation = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Resignation
      .addCase(submitResignation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitResignation.fulfilled, (state, action: PayloadAction<Resignation>) => {
        state.isLoading = false;
        state.activeResignation = action.payload;
        // Prepend to resignations list
        state.resignations = [action.payload, ...state.resignations];
      })
      .addCase(submitResignation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Employee Resignations
      .addCase(fetchEmployeeResignations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeResignations.fulfilled, (state, action: PayloadAction<Resignation[]>) => {
        state.isLoading = false;
        state.resignations = action.payload;
        // Set the most recent active resignation
        state.activeResignation = action.payload.length > 0 ? action.payload[0] : null;
      })
      .addCase(fetchEmployeeResignations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch All Resignations (HR)
      .addCase(fetchAllResignations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllResignations.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // In case API returns list wrap inside object
        state.resignations = action.payload.resignations || action.payload;
      })
      .addCase(fetchAllResignations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Conclude Resignation (HR)
      .addCase(concludeResignation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(concludeResignation.fulfilled, (state, action: PayloadAction<Resignation>) => {
        state.isLoading = false;
        // Update item in list
        state.resignations = state.resignations.map((r) =>
          r.id === action.payload.id ? action.payload : r
        );
        if (state.activeResignation && state.activeResignation.id === action.payload.id) {
          state.activeResignation = action.payload;
        }
      })
      .addCase(concludeResignation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearResignationError, resetResignationState } = resignationSlice.actions;
export default resignationSlice.reducer;
