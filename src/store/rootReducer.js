import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import leaveReducer from './slices/leaveSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import teamReducer from './slices/teamSlice';
import departmentReducer from './slices/departmentSlice';
import leaveTypeReducer from './slices/leaveTypeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  leave: leaveReducer,
  user: userReducer,
  ui: uiReducer,
  team: teamReducer,
  departments: departmentReducer,
  leaveTypes: leaveTypeReducer,
});

export default rootReducer; 