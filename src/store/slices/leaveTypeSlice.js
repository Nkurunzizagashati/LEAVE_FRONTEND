import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get auth token from sessionStorage
const getAuthToken = () => {
  const authResponse = sessionStorage.getItem('authResponse');
  if (authResponse) {
    try {
      const { token } = JSON.parse(authResponse);
      if (!token) {
        console.error('No token found in authResponse');
        return null;
      }
      return token;
    } catch (error) {
      console.error('Error parsing authResponse:', error);
      return null;
    }
  }
  console.error('No authResponse found in sessionStorage');
  return null;
};

// Async thunks
export const fetchLeaveTypes = createAsyncThunk(
  'leaveTypes/fetchLeaveTypes',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get('http://localhost:3002/api/types', {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch leave types');
    }
  }
);

export const addLeaveType = createAsyncThunk(
  'leaveTypes/addLeaveType',
  async (leaveTypeData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.post('http://localhost:3002/api/types', leaveTypeData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add leave type');
    }
  }
);

export const updateLeaveType = createAsyncThunk(
  'leaveTypes/updateLeaveType',
  async ({ id, leaveTypeData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.put(`http://localhost:3002/api/types/${id}`, leaveTypeData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update leave type');
    }
  }
);

export const deleteLeaveType = createAsyncThunk(
  'leaveTypes/deleteLeaveType',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      await axios.delete(`http://localhost:3002/api/leave-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete leave type');
    }
  }
);

const initialState = {
  leaveTypes: [],
  loading: false,
  error: null,
  selectedLeaveType: null,
};

const leaveTypeSlice = createSlice({
  name: 'leaveTypes',
  initialState,
  reducers: {
    setSelectedLeaveType: (state, action) => {
      state.selectedLeaveType = action.payload;
    },
    clearLeaveTypeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveTypes = action.payload.data;
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addLeaveType.fulfilled, (state, action) => {
        state.leaveTypes.push(action.payload);
      })
      .addCase(updateLeaveType.fulfilled, (state, action) => {
        const index = state.leaveTypes.findIndex(type => type.id === action.payload.id);
        if (index !== -1) state.leaveTypes[index] = action.payload;
      })
      .addCase(deleteLeaveType.fulfilled, (state, action) => {
        state.leaveTypes = state.leaveTypes.filter(type => type.id !== action.payload);
      });
  },
});

export const { setSelectedLeaveType, clearLeaveTypeError } = leaveTypeSlice.actions;

export default leaveTypeSlice.reducer;
