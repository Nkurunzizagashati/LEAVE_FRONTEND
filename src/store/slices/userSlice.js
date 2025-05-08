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

// Async thunk for updating user
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.patch(
        `http://localhost:8080/api/users/${userId}`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for getting logged-in user
export const getLoggedInUser = createAsyncThunk(
  'user/getLoggedInUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`http://localhost:8080/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  userProfile: null,
  department: null,
  manager: null,
  team: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Fetch User Profile
    fetchUserProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserProfileSuccess: (state, action) => {
      state.userProfile = action.payload;
      state.loading = false;
    },
    fetchUserProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch Department Info
    fetchDepartmentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDepartmentSuccess: (state, action) => {
      state.department = action.payload;
      state.loading = false;
    },
    fetchDepartmentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch Manager Info
    fetchManagerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchManagerSuccess: (state, action) => {
      state.manager = action.payload;
      state.loading = false;
    },
    fetchManagerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch Team Info
    fetchTeamStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTeamSuccess: (state, action) => {
      state.team = action.payload;
      state.loading = false;
    },
    fetchTeamFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update User Profile
    updateUserProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateUserProfileSuccess: (state, action) => {
      state.userProfile = action.payload;
      state.loading = false;
    },
    updateUserProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear Error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get logged-in user
      .addCase(getLoggedInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoggedInUser.fulfilled, (state, action) => {
        state.userProfile = action.payload;
        state.loading = false;
      })
      .addCase(getLoggedInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  fetchUserProfileStart,
  fetchUserProfileSuccess,
  fetchUserProfileFailure,
  fetchDepartmentStart,
  fetchDepartmentSuccess,
  fetchDepartmentFailure,
  fetchManagerStart,
  fetchManagerSuccess,
  fetchManagerFailure,
  fetchTeamStart,
  fetchTeamSuccess,
  fetchTeamFailure,
  updateUserProfileStart,
  updateUserProfileSuccess,
  updateUserProfileFailure,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
