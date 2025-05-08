import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import leaveService from '../../services/leaveService';

// Async thunk for fetching leave history
export const fetchLeaveHistory = createAsyncThunk(
  'leave/fetchLeaveHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3002/api/requests/my-requests', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching leave balance
export const fetchLeaveBalance = createAsyncThunk(
  'leave/fetchLeaveBalance',
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3002/api/balances/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leave balance');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  leaveRequests: [],
  leaveBalance: {
    annual: 0,
    sick: 0,
    casual: 0,
  },
  leaveHistory: [],
  loading: false,
  error: null,
  currentRequest: null,
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    // Leave Requests
    fetchLeaveRequestsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLeaveRequestsSuccess: (state, action) => {
      state.leaveRequests = action.payload;
      state.loading = false;
    },
    fetchLeaveRequestsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Leave Balance
    fetchLeaveBalanceStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLeaveBalanceSuccess: (state, action) => {
      state.leaveBalance = action.payload;
      state.loading = false;
    },
    fetchLeaveBalanceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Leave History
    fetchLeaveHistoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLeaveHistorySuccess: (state, action) => {
      state.leaveHistory = action.payload;
      state.loading = false;
    },
    fetchLeaveHistoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create Leave Request
    createLeaveRequestStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createLeaveRequestSuccess: (state, action) => {
      state.leaveRequests.push(action.payload);
      state.loading = false;
    },
    createLeaveRequestFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update Leave Request
    updateLeaveRequestStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateLeaveRequestSuccess: (state, action) => {
      const index = state.leaveRequests.findIndex(
        (request) => request.id === action.payload.id
      );
      if (index !== -1) {
        state.leaveRequests[index] = action.payload;
      }
      state.loading = false;
    },
    updateLeaveRequestFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set Current Request
    setCurrentRequest: (state, action) => {
      state.currentRequest = action.payload;
    },

    // Clear Error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveHistory = action.payload;
      })
      .addCase(fetchLeaveHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveBalance = action.payload;
      })
      .addCase(fetchLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  fetchLeaveRequestsStart,
  fetchLeaveRequestsSuccess,
  fetchLeaveRequestsFailure,
  fetchLeaveBalanceStart,
  fetchLeaveBalanceSuccess,
  fetchLeaveBalanceFailure,
  fetchLeaveHistoryStart,
  fetchLeaveHistorySuccess,
  fetchLeaveHistoryFailure,
  createLeaveRequestStart,
  createLeaveRequestSuccess,
  createLeaveRequestFailure,
  updateLeaveRequestStart,
  updateLeaveRequestSuccess,
  updateLeaveRequestFailure,
  setCurrentRequest,
  clearError,
} = leaveSlice.actions;

export default leaveSlice.reducer; 