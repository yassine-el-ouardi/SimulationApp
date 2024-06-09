// reducers/index.ts
import { combineReducers } from '@reduxjs/toolkit';
import headerReducer from '../components/dashboard/headerSlice';

const rootReducer = combineReducers({
  header: headerReducer,
  // Add other reducers here
});

export default rootReducer;