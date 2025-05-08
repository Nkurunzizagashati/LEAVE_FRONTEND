import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching team members
export const fetchTeamMembers = createAsyncThunk(
  'team/fetchTeamMembers',
  async (_, { rejectWithValue }) => {
    try {
      const storedResponse = localStorage.getItem('authResponse');
      if (!storedResponse) {
        throw new Error('No authentication data found');
      }

      const authData = JSON.parse(storedResponse);
      const token = authData?.token;

      const response = await fetch(`http://localhost:3002/api/teams/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  teamMembers: [],
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearTeamError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = action.payload?.data || []; // assuming data is wrapped in a `data` key
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTeamError } = teamSlice.actions;

export default teamSlice.reducer;
