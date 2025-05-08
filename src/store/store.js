import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import leaveReducer from './slices/leaveSlice';
import teamReducer from './slices/teamSlice';
import departmentReducer from './slices/departmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    leave: leaveReducer,
    team: teamReducer,
    departments: departmentReducer,
  },
}); 