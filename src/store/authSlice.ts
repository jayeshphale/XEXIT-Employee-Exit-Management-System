import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AuthState, User } from "../types";
import {
  registerUserApi,
  loginUserApi,
  fetchCurrentUserApi,
  updateUserProfileApi,
  changeUserPasswordApi,
} from "../api/authApi";

// Get token from local storage if it exists
const savedToken = localStorage.getItem("xexit_token");

const initialState: AuthState = {
  user: null,
  token: savedToken,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,
};

// Set authorization header helper
const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Apply initial token to Axios headers if it exists
if (savedToken) {
  setAuthHeader(savedToken);
}

// Asynchronous Thunks
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: Omit<User, "id" | "role"> & { password?: string }, { rejectWithValue }) => {
    try {
      const data = await registerUserApi(userData);
      const { token, user } = data;
      
      localStorage.setItem("xexit_token", token);
      setAuthHeader(token);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email?: string; username?: string; password?: string }, { rejectWithValue }) => {
    try {
      const data = await loginUserApi(credentials);
      const { token, user } = data;
      
      localStorage.setItem("xexit_token", token);
      setAuthHeader(token);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.token) {
        return rejectWithValue("No active session found");
      }
      setAuthHeader(state.auth.token);
      const data = await fetchCurrentUserApi();
      return data.user;
    } catch (error: any) {
      localStorage.removeItem("xexit_token");
      setAuthHeader(null);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Session expired"
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const data = await updateUserProfileApi(profileData);
      return data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update profile"
      );
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData: { currentPassword?: string; newPassword?: string }, { rejectWithValue }) => {
    try {
      const data = await changeUserPasswordApi(passwordData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to change password"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("xexit_token");
      setAuthHeader(null);
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    // Seed Demo HR Admin if no DB is connected/configured
    seedDemoAdmin: (state) => {
      state.user = {
        id: "admin-1",
        firstName: "HR",
        lastName: "Admin",
        email: "admin@xexit.com",
        role: "admin",
        country: "US",
        department: "Human Resources",
        employeeId: "HR001",
        phoneNumber: "+15550199",
        joiningDate: new Date().toISOString(),
        designation: "HR Administrator",
      };
      state.token = "demo-admin-token";
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      localStorage.setItem("xexit_token", "demo-admin-token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Change Password
      .addCase(changeUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError, seedDemoAdmin } = authSlice.actions;
export default authSlice.reducer;
